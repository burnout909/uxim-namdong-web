import Title from "@/components/Title";

export default function PrivacyPolicy() {
  return (
    <div className="py-8 md:py-10">
      <Title text="개인정보처리방침" />

      <div className="mt-6 prose prose-sm md:prose-base max-w-none text-gray-700">
        <p className="text-sm text-gray-500 mb-6">시행일: 2026년 3월 18일</p>

        <p>
          남동시니어클럽(이하 &quot;기관&quot;)은 개인정보보호법 등 관련 법령에 따라
          이용자의 개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수
          있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>

        <h3 className="text-base md:text-lg font-bold text-gray-800 mt-8 mb-3">
          제1조 (개인정보의 처리 목적)
        </h3>
        <p>
          기관은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는
          개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이
          변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>노인일자리 및 사회활동 지원사업 참여자 관리</li>
          <li>홈페이지 자유게시판 운영</li>
          <li>민원 처리 및 문의 응대</li>
        </ul>

        <h3 className="text-base md:text-lg font-bold text-gray-800 mt-8 mb-3">
          제2조 (처리하는 개인정보의 항목)
        </h3>
        <p>기관은 최소한의 개인정보를 수집하며, 그 항목은 다음과 같습니다.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>자유게시판: 작성자가 직접 입력하는 내용 (비밀번호 등)</li>
          <li>사업 참여 신청: 성명, 연락처, 주소, 생년월일 등</li>
        </ul>

        <h3 className="text-base md:text-lg font-bold text-gray-800 mt-8 mb-3">
          제3조 (개인정보의 처리 및 보유 기간)
        </h3>
        <p>
          기관은 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를
          수집 시에 동의 받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>사업 참여 관련: 사업 종료 후 5년</li>
          <li>홈페이지 게시판: 게시글 삭제 시까지</li>
        </ul>

        <h3 className="text-base md:text-lg font-bold text-gray-800 mt-8 mb-3">
          제4조 (개인정보의 파기)
        </h3>
        <p>
          기관은 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게
          되었을 때에는 지체 없이 해당 개인정보를 파기합니다. 전자적 파일 형태의
          정보는 복구 및 재생이 불가능한 방법으로 파기하며, 종이에 출력된 개인정보는
          분쇄기로 분쇄하거나 소각하여 파기합니다.
        </p>

        <h3 className="text-base md:text-lg font-bold text-gray-800 mt-8 mb-3">
          제5조 (정보주체의 권리·의무 및 행사방법)
        </h3>
        <p>
          정보주체는 기관에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의
          권리를 행사할 수 있습니다. 권리 행사는 기관에 서면, 전화, 이메일 등을 통하여
          하실 수 있으며, 기관은 이에 대해 지체 없이 조치하겠습니다.
        </p>

        <h3 className="text-base md:text-lg font-bold text-gray-800 mt-8 mb-3">
          제6조 (개인정보의 안전성 확보 조치)
        </h3>
        <p>기관은 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>개인정보 접근 권한 제한</li>
          <li>개인정보의 암호화</li>
          <li>해킹 등에 대비한 기술적 대책</li>
        </ul>

        <h3 className="text-base md:text-lg font-bold text-gray-800 mt-8 mb-3">
          제7조 (개인정보 보호책임자)
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p>기관명: 남동시니어클럽</p>
          <p>전화: 032-267-6080</p>
          <p>이메일: contact@namdongsenior.or.kr</p>
          <p>주소: 인천 남동구 문화서로62번길 13 (구월동)</p>
        </div>

        <h3 className="text-base md:text-lg font-bold text-gray-800 mt-8 mb-3">
          제8조 (개인정보처리방침 변경)
        </h3>
        <p>
          이 개인정보처리방침은 2026년 3월 18일부터 적용됩니다.
          변경 시 홈페이지를 통해 공지하겠습니다.
        </p>
      </div>
    </div>
  );
}
