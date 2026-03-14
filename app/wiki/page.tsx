export default async function WikiPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EE] px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-3xl rounded-[2rem] border-2 border-black bg-white p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] sm:p-12">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Wiki</p>
        <h1 className="text-3xl font-bold uppercase tracking-wide text-black sm:text-4xl">Đang bảo trì</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
          Khu vực Wiki đang được nâng cấp để phục vụ bạn tốt hơn. Vui lòng quay lại sau.
        </p>
      </div>
    </div>
  );
}
