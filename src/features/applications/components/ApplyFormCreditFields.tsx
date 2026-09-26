import { EDUCATION_LEVEL_OPTIONS, HOME_OWNERSHIP_OPTIONS } from '../constant';
import type { UpdateApplyFormField } from '../hook/useApplyForm';
import type { ApplicationFormErrors, ApplicationFormValues } from '../schemas/applicationForm';
import ApplyFormInputRow from './ApplyFormInputRow';
import ApplyFormSelectRow from './ApplyFormSelectRow';

type Props = {
  values: ApplicationFormValues;
  errors: ApplicationFormErrors;
  onChange: UpdateApplyFormField;
};

/**
 * Năm trường hồ sơ tín dụng tự khai (thu nhập, nghĩa vụ nợ, thâm niên, học vấn,
 * nhà ở) — đúng các trường, nhãn, câu gợi ý và mức bắt buộc của màn cũ; chỉ đổi
 * cách trình bày. Học vấn và nhà ở chuyển từ nhóm chip sang dòng mở bảng chọn.
 */
export default function ApplyFormCreditFields({ values, errors, onChange }: Props) {
  return (
    <>
      <ApplyFormInputRow
        // Chồng đồng xu như mockup; biểu tượng `coins` sẵn có (hai đồng xu lệch) khó nhận ra ở cỡ 22pt.
        icon="database"
        label="Thu nhập hàng tháng"
        kind="money"
        required
        value={values.monthlyIncome}
        onChangeText={(value) => onChange('monthlyIncome', value)}
        placeholder="Nhập thu nhập hàng tháng"
        helper="Thông tin tự khai, đơn vị đồng"
        error={errors.income}
      />
      <ApplyFormInputRow
        icon="calendar"
        label="Nghĩa vụ nợ hàng tháng"
        kind="money"
        required
        value={values.monthlyDebt}
        onChangeText={(value) => onChange('monthlyDebt', value)}
        // Để trống cũng được tính là 0 (schema lọc chữ số), nên gợi ý "0" là đúng nghĩa.
        placeholder="0"
        // Khoảng trắng không ngắt giữ "để 0" cùng dòng khi câu gợi ý xuống dòng ở màn hẹp.
        helper={'Tổng các khoản phải trả mỗi tháng; không có thì để\u00a00'}
        error={errors.debt}
      />
      <ApplyFormInputRow
        icon="briefcase"
        label="Thâm niên làm việc (tháng)"
        kind="number"
        value={values.employmentMonths}
        onChangeText={(value) => onChange('employmentMonths', value)}
        placeholder="Nhập số tháng làm việc"
        helper="Không bắt buộc"
        error={errors.employment}
      />
      <ApplyFormSelectRow
        icon="graduationCap"
        label="Trình độ học vấn"
        options={EDUCATION_LEVEL_OPTIONS}
        value={values.educationLevel}
        onChange={(value) => onChange('educationLevel', value)}
        placeholder="Chọn trình độ học vấn"
      />
      <ApplyFormSelectRow
        icon="home"
        label="Tình trạng nhà ở"
        required
        options={HOME_OWNERSHIP_OPTIONS}
        value={values.homeOwnership}
        onChange={(value) => onChange('homeOwnership', value)}
        placeholder="Chọn tình trạng nhà ở"
        error={errors.home}
      />
    </>
  );
}
