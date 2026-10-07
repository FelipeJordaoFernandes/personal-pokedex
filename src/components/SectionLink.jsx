export default function SectionLink({ targetId, children, ...props }) {
  function navigate(event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      event.currentTarget.target === "_blank"
    ) return;

    const destination = document.getElementById(targetId);
    if (!destination) return;

    event.preventDefault();
    destination.focus({ preventScroll: true });
    destination.scrollIntoView({ block: "start", behavior: "auto" });
  }

  return (
    <a {...props} href={`#${targetId}`} onClick={navigate}>
      {children}
    </a>
  );
}
