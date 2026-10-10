const PageHeader = ({
  title,
  description,
  className = "",
  align = "left",
}) => {
  return (
    <div
      className={`space-y-2 ${
        align === "center" ? "text-center" : "text-left"
      } ${className}`}
    >
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>

      {description && (
        <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;