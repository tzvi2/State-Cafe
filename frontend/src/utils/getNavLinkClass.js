export const getNavLinkClass = (isActive, baseClass, activeClass) =>
	isActive ? `${baseClass} ${activeClass}` : baseClass;
