export default  function FillButton(onClick: () => void) {
    return (
        <button 
        onClick={()=> onClick()}
        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-body-medium rounded">
            등록
        </button>
    );
}