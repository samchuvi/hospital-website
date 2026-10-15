import { forwardRef } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';

const ICONS = { error: CircleAlert, success: CircleCheck, info: Info, warning: TriangleAlert };

const Alert = forwardRef(function Alert({ tone = 'info', title, children, live, ...rest }, ref) {
  const Icon = ICONS[tone];
  return (
    <div
      ref={ref}
      className={`alert alert--${tone}`}
      role={live ? (tone === 'error' ? 'alert' : 'status') : undefined}
      tabIndex={-1}
      {...rest}
    >
      <Icon size={20} aria-hidden="true" className="alert__icon" />
      <div>
        {title && <p className="alert__title">{title}</p>}
        <div className="alert__body">{children}</div>
      </div>
    </div>
  );
});

export default Alert;
