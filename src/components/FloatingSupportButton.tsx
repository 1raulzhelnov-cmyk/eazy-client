import SupportChat from "./SupportChat";

const FloatingSupportButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <SupportChat />
    </div>
  );
};

export default FloatingSupportButton;