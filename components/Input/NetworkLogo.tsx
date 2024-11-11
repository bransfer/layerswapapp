import { FC } from "react";

import AppSettings from "../../lib/AppSettings";

type Props = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  className?: string;
};

const NetworkLogo: FC<Props> = (props) => {
  const {
    x = 0,
    y = 0,
    width = 24,
    height = 24,
    className = "rounded-md",
  } = props;
  const url = `${AppSettings.ImageStorage}spritesheet.png`;

  return (
    <div
      className={className}
      style={{
        background: `url('${url}') -${x}px -${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    ></div>
  );
};

export default NetworkLogo;
