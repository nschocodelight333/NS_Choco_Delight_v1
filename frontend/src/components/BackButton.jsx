import { useLocation, useNavigate } from 'react-router-dom';

const BackButton = ({ customLabel, customPath, className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathname = location.pathname;

  // Hide on Home ('/') and Admin Root ('/admin')
  if (pathname === '/' || pathname === '/admin') {
    return null;
  }

  const handleBack = () => {
    if (customPath) {
      navigate(customPath);
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div
      className={`page-container flex justify-start items-center pt-3 pb-1 transition-all ${className}`}
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
    >
      <button
        type="button"
        onClick={handleBack}
        id="global-back-btn"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-choco-900 text-xs font-semibold border border-choco-200/80 shadow-sm hover:shadow-md transition-all group cursor-pointer active:scale-95"
        aria-label="Go back"
      >
        {/* ChevronLeft Icon */}
        <svg
          className="w-4 h-4 text-choco-800 group-hover:-translate-x-0.5 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        <span>{customLabel || 'Back'}</span>
      </button>
    </div>
  );
};

export default BackButton;
