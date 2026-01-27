export function getErrorMessage(error: any): string {
  if (!error) return "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
  
  const code = typeof error === 'string' ? error : error.code;
  const message = typeof error === 'object' ? error.message : '';

  // Handle common Postgres error codes from Supabase
  switch (code) {
    case '23505': // unique_violation
      if (message?.includes('nickname')) {
        return "Bút danh này đã được sử dụng. Vui lòng chọn tên khác.";
      }
      return "Dữ liệu này đã tồn tại.";
      
    case '23514': // check_violation
      if (message?.toLowerCase().includes('sentence') || message?.toLowerCase().includes('character')) {
        return "Nội dung không tuân thủ quy tắc về số câu/kí tự của tác phẩm này.";
      }
      if (message?.toLowerCase().includes('limit') || message?.toLowerCase().includes('rule')) {
        return "Nội dung không tuân thủ quy tắc sáng tác của tác phẩm này.";
      }
      return "Nội dung không hợp lệ hoặc vi phạm quy tắc của hệ thống.";
      
    case '42501': // insufficient_privilege
      return "Bạn không có quyền thực hiện thao tác này.";
      
    case '23503': // foreign_key_violation
      return "Dữ liệu liên quan không tồn tại.";

    case 'P0001': // raise_exception (Custom procedural error)
       if (message?.includes('daily limit')) {
         return "Bạn đã đạt giới hạn đóng góp trong ngày cho tác phẩm này.";
       }
       return message || "Lỗi nghiệp vụ hệ thống.";

    default:
      // If it's a known error code but not handled specifically
      if (code && typeof code === 'string' && code.length === 5) {
        return `Lỗi hệ thống (${code}). Vui lòng thử lại sau.`;
      }
      return typeof error === 'string' ? error : (error.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.");
  }
}
