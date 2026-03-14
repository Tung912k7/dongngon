"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/utils/error-handler";
import { checkRateLimitDistributed } from "@/utils/rate-limit";
import { captureServerEvent } from "@/utils/posthog-server";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VOTE_LIMIT = 10;
const VOTE_WINDOW_MS = 60 * 1000;

function isValidUuid(value: string) {
  return UUID_V4_REGEX.test(value);
}

export async function voteEndWork(workId: string) {
  const supabase = await createClient();

  if (!isValidUuid(workId)) {
    return { error: "ID tác phẩm không hợp lệ." };
  }

  // 1. Check Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập để bình chọn." };
  }

  const voteRate = await checkRateLimitDistributed(
    supabase,
    `vote-end-work:user:${user.id}`,
    VOTE_LIMIT,
    VOTE_WINDOW_MS
  );
  if (!voteRate.allowed) {
    return {
      error: `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${voteRate.retryAfterSeconds} giây.`,
    };
  }

  // 2. Check if user is a contributor
  const { data: contribution } = await supabase
    .from("contributions")
    .select("id")
    .eq("work_id", workId)
    .eq("user_id", user.id)
    .limit(1);

  if (!contribution || contribution.length === 0) {
    return { error: "Bạn cần đóng góp nội dung trước khi bình chọn kết thúc." };
  }

  // 3. Check if already voted
  const { data: existingVote } = await supabase
    .from("finish_votes")
    .select("id")
    .eq("work_id", workId)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    return { error: "Bạn đã bình chọn rồi." };
  }

  // 4. Insert Vote
  const { error: voteError } = await supabase.from("finish_votes").insert({
    work_id: workId,
    user_id: user.id,
  });

  if (voteError) {
    // If it's a unique constraint violation, they already voted
    if (voteError.code === '23505') {
        return { error: "Bạn đã bình chọn rồi." };
    }
    console.error("Vote error:", voteError);
    return { error: getErrorMessage(voteError) };
  }

  // 5. Get current votes count
  const { count: currentVotes } = await supabase
    .from("finish_votes")
    .select("*", { count: "exact", head: true })
    .eq("work_id", workId);

  const currentCount = currentVotes || 0;

  // 6. Threshold logic: Always fetch latest contributor count to avoid stale props
  const { data: contributions } = await supabase
    .from("contributions")
    .select("user_id")
    .eq("work_id", workId);
  
  const uniqueContributors = new Set(contributions?.map(c => c.user_id) || []).size;
  const threshold = Math.max(1, Math.floor(uniqueContributors / 2) + 1);
  let didTransitionToFinished = false;

  if (currentCount >= threshold) {
     const { data: transitionedRow, error: updateError } = await supabase
       .from("works")
       .update({ status: "finished" })
       .eq("id", workId)
       .neq("status", "finished")
       .select("id")
       .maybeSingle();
       
     if (updateError) {
         console.error("Critical error updating work status to finished:", updateError);
     } else {
         didTransitionToFinished = !!transitionedRow;
     }
  }

  await captureServerEvent(user.id, 'vote_submitted', {
    work_id: workId,
    event_source: 'server_action',
    event_version: 1,
  });

  if (didTransitionToFinished) {
    await captureServerEvent(user.id, 'work_completed', {
      work_id: workId,
      vote_count: currentCount,
      unique_contributors: uniqueContributors,
      event_source: 'server_action',
      event_version: 1,
    });
  }

  revalidatePath(`/work/${workId}`);
  revalidatePath("/kho-tang");
  return { success: true, newCount: currentCount };
}
