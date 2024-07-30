const CustomContainer = ({ children }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "maxContent",
        minHeight: "100vh",
        position: "relative",
      }}>
      {children}
    </div>
  );
};

export default CustomContainer;
