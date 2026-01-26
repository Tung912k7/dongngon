-- Create a function to validate contributions based on work rules
CREATE OR REPLACE FUNCTION validate_contribution()
RETURNS TRIGGER AS $$
DECLARE
    rule TEXT;
BEGIN
    -- Get the writing rule from the parent work
    SELECT writing_rule INTO rule FROM works WHERE id = NEW.work_id;

    -- 1 Character Rule: Exact Length 1 (after trimming)
    IF rule = '1 kí tự' THEN
        IF length(trim(NEW.content)) != 1 THEN
            RAISE EXCEPTION 'Quy tắc "1 kí tự": Nội dung phải có đúng 1 kí tự.';
        END IF;

    -- 1 Sentence Rule: Must end with . ! ? or …
    ELSIF rule = '1 câu' THEN
        -- Regex for standard terminal punctuation
        -- Note: ~ is POSIX regex operator in Postgres
        IF NOT (trim(NEW.content) ~ '[.!?…]$') THEN
             RAISE EXCEPTION 'Quy tắc "1 câu": Câu phải kết thúc bằng dấu câu (. ! ? …).';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dropping trigger if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS trg_validate_contribution ON contributions;

-- Attach the trigger to the contributions table
CREATE TRIGGER trg_validate_contribution
BEFORE INSERT OR UPDATE ON contributions
FOR EACH ROW
EXECUTE FUNCTION validate_contribution();
