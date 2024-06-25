import React from "react";

function IframeRender({ url }) {
  const isValidUrl = () => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (!isValidUrl()) {
    <p style={{ color: "red", marginTop: "10px", fontSize: "12px" }}>
      Invalid URL
    </p>;
  }

  return (
    <iframe
      src={url}
      title="iframe"
      className="w-full h-full"
      style={{
        height: "500px",
        marginTop: "10px",
        border: "1px solid #ccc",
      }}
      allowFullScreen
    />
  );
}

export default IframeRender;
