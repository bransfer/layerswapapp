import { renderToStaticMarkup } from "react-dom/server";

export default function convertSvgComponentToBase64(Component, props = {}) {
    // Render the React component to an SVG string
    const svgString = renderToStaticMarkup(<Component {...props} />);

    // Convert the SVG string to Base64
    const base64Encoded = btoa(encodeURIComponent(svgString).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));

    // Return the data URL
    return `data:image/svg+xml;base64,${base64Encoded}`;
}