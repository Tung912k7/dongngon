import TableFilter from "@/components/TableFilter";

export default function DongNgonPage() {
  return (
    <div className="min-h-screen bg-white text-black font-roboto">
      
      {/* Header is now global in layout.tsx */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 flex flex-col items-center">
        
        {/* Ranking Placeholder */}
        <div className="w-full max-w-3xl bg-black text-white h-48 flex items-center justify-center mb-16 rounded-sm mt-8">
          <p className="text-xl font-roboto">Chức năng xếp hạng: Chưa thiết kế xong giao diện</p>
        </div>

        {/* Data Table */}
        <div className="w-full max-w-6xl relative">
          
          <div className="border border-black rounded-lg overflow-hidden font-roboto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black">
                  <th className="py-4 px-6 font-normal w-[20%]">
                    <div className="flex items-center">
                      <TableFilter />
                      <span>Tên văn bản</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 font-normal w-[15%]">Ngày tạo</th>
                  <th className="py-4 px-6 font-normal w-[15%]">Loại văn bản</th>
                  <th className="py-4 px-6 font-normal w-[15%]">Hình thức</th>
                  <th className="py-4 px-6 font-normal w-[20%]">Quy tắc viết</th>
                  <th className="py-4 px-6 font-normal w-[15%]">Tiến độ</th>
                </tr>
              </thead>
              <tbody>
                {/* Empty Rows Generator */}
                {[...Array(6)].map((_, index) => (
                  <tr key={index} className="border-b border-black last:border-none hover:bg-gray-50">
                    <td className="py-4 px-6 h-12 break-words whitespace-normal"></td>
                    <td className="py-4 px-6 h-12 break-words whitespace-normal"></td>
                    <td className="py-4 px-6 h-12 break-words whitespace-normal"></td>
                    <td className="py-4 px-6 h-12 break-words whitespace-normal"></td>
                    <td className="py-4 px-6 h-12 break-words whitespace-normal"></td>
                    <td className="py-4 px-6 h-12 break-words whitespace-normal"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
