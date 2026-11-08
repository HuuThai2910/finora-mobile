/**
 * Một khối nội dung trong một mục điều khoản: chuỗi là một đoạn văn, mảng là một danh sách gạch đầu dòng.
 * Giữ dạng dữ liệu thay vì Markdown để không phải kéo bộ đọc Markdown của feature `ekyc` sang đây.
 */
export type TermsBlock = string | readonly string[];

export type TermsSection = { title: string; blocks: readonly TermsBlock[] };

/**
 * Điều khoản sử dụng hiển thị trong app (Hồ sơ › Điều khoản). Nội dung tĩnh, chưa có API phiên bản điều khoản chung
 * như điều khoản eKYC; đổi nội dung thì đổi luôn `TERMS_UPDATED_AT`. Không nêu con số lãi suất hay phí cụ thể: các
 * con số đó luôn lấy từ sản phẩm và hợp đồng của từng khoản vay.
 */
export const TERMS_UPDATED_AT = '06/11/2026';

export const TERMS_INTRO =
  'Điều khoản này là thỏa thuận giữa bạn và FINORA khi bạn dùng ứng dụng FINORA để vay, đầu tư hoặc quản lý ví. Khi ' +
  'tạo tài khoản, bạn xác nhận đã đọc, hiểu và đồng ý với các điều khoản dưới đây.';

export const TERMS_SECTIONS: readonly TermsSection[] = [
  {
    title: '1. FINORA là gì',
    blocks: [
      'FINORA là nền tảng kết nối người cần vay vốn (người vay) với người có vốn nhàn rỗi muốn cho vay (nhà đầu tư). ' +
        'FINORA thẩm định hồ sơ, đưa khoản vay lên sàn gọi vốn, lập hợp đồng, giải ngân, thu nợ và chuyển tiền trả nợ ' +
        'cho nhà đầu tư.',
      'FINORA không phải ngân hàng, không nhận tiền gửi và không dùng vốn của mình để cho vay. Khoản vay được cấp từ ' +
        'vốn của các nhà đầu tư tham gia gọi vốn.',
    ],
  },
  {
    title: '2. Ai được sử dụng',
    blocks: [
      [
        'Công dân Việt Nam từ đủ 18 tuổi, có đủ năng lực hành vi dân sự.',
        'Có thẻ Căn cước công dân hoặc thẻ Căn cước còn hiệu lực.',
        'Mỗi người chỉ có một tài khoản FINORA.',
      ],
      'Bạn xem được sản phẩm khi chưa định danh, nhưng phải hoàn tất xác minh danh tính (eKYC) trước khi vay hoặc đầu tư.',
    ],
  },
  {
    title: '3. Tài khoản và bảo mật',
    blocks: [
      [
        'Thông tin bạn khai báo phải đúng, đầy đủ và được cập nhật khi thay đổi.',
        'Bạn tự giữ bí mật mật khẩu, mã OTP và mã PIN giao dịch; không chia sẻ cho bất kỳ ai, kể cả người tự nhận là ' +
          'nhân viên FINORA.',
        'Mọi thao tác được xác nhận bằng mật khẩu, mã OTP, mã PIN hoặc chữ ký số của bạn được coi là do chính bạn thực ' +
          'hiện.',
        'Khi nghi ngờ tài khoản bị lộ, hãy đổi mật khẩu và báo ngay cho FINORA qua mục Hỗ trợ.',
      ],
    ],
  },
  {
    title: '4. Dành cho người vay',
    blocks: [
      [
        'Thông tin trong hồ sơ vay (thu nhập, nghề nghiệp, mục đích vay...) phải trung thực. Hồ sơ khai sai có thể bị ' +
          'từ chối hoặc khoản vay bị thu hồi trước hạn.',
        'FINORA thẩm định hồ sơ, có thể dùng hệ thống chấm điểm tín dụng tự động, và có quyền từ chối hồ sơ mà không ' +
          'cần nêu chi tiết lý do.',
        'Lãi suất, phí và lịch trả dự kiến được hiển thị trước khi bạn nộp hồ sơ. Nếu điều khoản sau thẩm định bất lợi ' +
          'hơn lúc nộp, FINORA phải hỏi lại và chỉ tiếp tục khi bạn chấp nhận.',
        'Khoản vay chỉ được giải ngân khi đã gọi đủ vốn và bạn đã ký hợp đồng.',
        'Bạn có nghĩa vụ trả nợ đúng hạn theo lịch trong hợp đồng. Trả chậm có thể phát sinh lãi chậm trả, phí theo ' +
          'hợp đồng và ảnh hưởng tới các lần vay sau.',
        'Bạn có thể trả trước một phần, tất toán sớm hoặc đề nghị cơ cấu lại khoản vay theo điều kiện của hợp đồng. ' +
          'Đề nghị cơ cấu cần được thẩm định và nhà đầu tư của khoản vay biểu quyết chấp thuận.',
      ],
    ],
  },
  {
    title: '5. Dành cho nhà đầu tư',
    blocks: [
      [
        'Cho vay luôn có rủi ro, kể cả rủi ro mất một phần hoặc toàn bộ số tiền đầu tư khi người vay không trả được nợ.',
        'FINORA không bảo đảm lợi nhuận và không cam kết hoàn vốn. Lợi nhuận hiển thị là lợi nhuận dự kiến nếu người ' +
          'vay trả đúng hạn.',
        'Hạng tín dụng, điểm đánh giá và thông tin người vay chỉ để tham khảo; bạn tự quyết định đầu tư vào khoản nào.',
        'Mỗi khoản đầu tư được ghi nhận dưới dạng Note gắn với một khoản vay. Bạn có thể bán Note trên sàn, nhưng ' +
          'FINORA không bảo đảm luôn có người mua hoặc mua đúng giá bạn mong muốn.',
        'Khi bật Đầu tư tự động, FINORA đầu tư thay bạn theo đúng tiêu chí bạn đặt. Bạn chịu rủi ro như khi tự đầu tư ' +
          'và có thể tắt bất cứ lúc nào.',
        'Khi khoản vay đề nghị cơ cấu lại, bạn được tham gia biểu quyết chấp thuận hoặc từ chối.',
      ],
    ],
  },
  {
    title: '6. Ví và giao dịch tiền',
    blocks: [
      [
        'Ví FINORA dùng để nạp tiền đầu tư, nhận tiền giải ngân, trả nợ và nhận tiền trả nợ. Số dư ví không phải tiền ' +
          'gửi ngân hàng và không được hưởng lãi.',
        'Tiền chỉ được rút về tài khoản ngân hàng đứng tên chính bạn.',
        'Rút tiền, trả nợ, đầu tư, đặt lệnh trên sàn và ký hợp đồng đều phải được xác nhận bằng mã PIN giao dịch.',
        'FINORA có thể tạm giữ hoặc từ chối giao dịch có dấu hiệu bất thường để kiểm tra, và sẽ thông báo cho bạn.',
      ],
    ],
  },
  {
    title: '7. Hợp đồng điện tử và chữ ký số',
    blocks: [
      'Hợp đồng vay và hợp đồng đầu tư được lập dưới dạng tệp PDF và ký bằng chữ ký số (VNPT SmartCA). Hợp đồng điện ' +
        'tử đã ký có giá trị pháp lý như hợp đồng giấy theo pháp luật về giao dịch điện tử.',
      'Hãy đọc kỹ toàn bộ hợp đồng trước khi ký. Bạn xem và tải lại hợp đồng đã ký bất cứ lúc nào ở mục Hợp đồng.',
    ],
  },
  {
    title: '8. Dữ liệu cá nhân',
    blocks: [
      [
        'FINORA chỉ thu thập dữ liệu cần thiết để cung cấp dịch vụ: thông tin tài khoản, hồ sơ vay, giao dịch và dữ ' +
          'liệu xác minh danh tính.',
        'Dữ liệu xác minh danh tính (ảnh thẻ, video khuôn mặt) được xử lý theo Điều khoản eKYC riêng mà bạn đồng ý ' +
          'trước khi xác minh.',
        'Máy chủ của FINORA đặt ngoài Việt Nam, vì vậy dữ liệu của bạn được chuyển ra nước ngoài để xử lý và lưu trữ có ' +
          'mã hóa.',
        'FINORA không bán dữ liệu của bạn và không dùng dữ liệu cho quảng cáo của bên khác.',
        'Thông báo đẩy trên màn hình khóa không chứa số tiền hay mã khoản vay.',
        'Bạn có quyền xem, yêu cầu sửa, rút lại đồng ý hoặc yêu cầu xóa dữ liệu theo quy định pháp luật về bảo vệ dữ ' +
          'liệu cá nhân, qua mục Hỗ trợ.',
      ],
    ],
  },
  {
    title: '9. Hành vi bị cấm',
    blocks: [
      [
        'Khai thông tin giả, mạo danh người khác hoặc dùng giấy tờ không phải của mình.',
        'Cho người khác dùng tài khoản, hoặc dùng tài khoản của người khác.',
        'Dùng FINORA để rửa tiền, tài trợ khủng bố hoặc cho các giao dịch trái pháp luật.',
        'Can thiệp, dò quét, khai thác lỗi hệ thống hoặc dùng công cụ tự động để thao túng sàn gọi vốn và sổ lệnh.',
      ],
      'Vi phạm có thể dẫn tới tạm khóa tài khoản và được báo cho cơ quan có thẩm quyền khi pháp luật yêu cầu.',
    ],
  },
  {
    title: '10. Phí dịch vụ',
    blocks: [
      'FINORA có thể thu phí cho một số dịch vụ. Mức phí luôn được hiển thị rõ trước khi bạn xác nhận giao dịch hoặc ' +
        'ký hợp đồng. FINORA không thu khoản phí nào chưa được thông báo cho bạn.',
    ],
  },
  {
    title: '11. Tạm khóa và đóng tài khoản',
    blocks: [
      [
        'Bạn có thể yêu cầu đóng tài khoản khi đã tất toán mọi khoản vay, không còn nắm giữ Note và đã rút hết số dư ví.',
        'FINORA có thể tạm khóa tài khoản khi bạn vi phạm điều khoản này hoặc theo yêu cầu của cơ quan có thẩm quyền.',
        'Tài khoản bị khóa không làm mất nghĩa vụ trả nợ hay quyền nhận tiền trả nợ đã phát sinh theo hợp đồng.',
      ],
    ],
  },
  {
    title: '12. Giới hạn trách nhiệm',
    blocks: [
      'FINORA nỗ lực để dịch vụ hoạt động liên tục, nhưng dịch vụ có thể tạm gián đoạn khi bảo trì, khi có sự cố mạng ' +
        'hoặc sự cố từ đối tác (ngân hàng, dịch vụ chữ ký số). FINORA không chịu trách nhiệm cho thiệt hại phát sinh do ' +
        'bạn để lộ mật khẩu, mã OTP hoặc mã PIN.',
    ],
  },
  {
    title: '13. Thay đổi điều khoản',
    blocks: [
      'FINORA có thể cập nhật điều khoản này và sẽ thông báo trong ứng dụng trước khi áp dụng. Với thay đổi quan trọng, ' +
        'bạn sẽ được yêu cầu đọc và đồng ý lại. Hợp đồng đã ký vẫn giữ nguyên điều khoản tại thời điểm ký.',
    ],
  },
  {
    title: '14. Luật áp dụng và giải quyết tranh chấp',
    blocks: [
      'Điều khoản này tuân theo pháp luật Việt Nam. Tranh chấp được ưu tiên giải quyết bằng thương lượng qua mục Hỗ ' +
        'trợ; nếu không thương lượng được, các bên đưa ra Tòa án có thẩm quyền tại Việt Nam.',
    ],
  },
];
