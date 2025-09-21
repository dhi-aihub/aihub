import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Typography from "@mui/material/Typography";


const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});


import { useState } from "react";

export default function InputFileUpload({ text, onChange, accept = undefined, multiple = false }) {
  const [fileName, setFileName] = useState("");

  const handleChange = event => {
    const files = event.target.files;
    if (files.length > 0) {
      setFileName(multiple ? Array.from(files).map(f => f.name).join(", ") : files[0].name);
    } else {
      setFileName("");
    }
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div>
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
      >
        {text}
        <VisuallyHiddenInput onChange={handleChange} type="file" accept={accept} multiple={multiple} />
      </Button>
      {fileName && (
        <Typography
          variant="body2"
          color="success.main"
          style={{ marginTop: 8, fontSize: "0.875rem" }}
        >
          ✓ {fileName}
        </Typography>
      )}
    </div>
  );
}
