import { FC } from "react";
import { THEME_COLORS, ThemeData } from "../Models/Theme";

type Props = {
    themeData?: ThemeData | null
}
const ColorSchema: FC<Props> = ({ themeData }) => {
    themeData = themeData || THEME_COLORS.default

    return (
        <>
            {themeData &&
                <style global jsx>{`
                    :root {
                        --ls-colors-backdrop:${themeData.backdrop};
                        --ls-colors-logo: ${themeData.logo};
                        --ls-colors-primary: ${themeData.primary?.DEFAULT};
                        --ls-colors-primary-50: ${themeData.primary?.[50]};
                        --ls-colors-primary-100: ${themeData.primary?.[100]};
                        --ls-colors-primary-200: ${themeData.primary?.[200]};
                        --ls-colors-primary-300: ${themeData.primary?.[300]};
                        --ls-colors-primary-400: ${themeData.primary?.[400]};
                        --ls-colors-primary-500: ${themeData.primary?.[500]};
                        --ls-colors-primary-600: ${themeData.primary?.[600]};
                        --ls-colors-primary-700: ${themeData.primary?.[700]};
                        --ls-colors-primary-800: ${themeData.primary?.[800]};
                        --ls-colors-primary-900: ${themeData.primary?.[900]};

                        --ls-colors-actionButtonText: ${themeData.actionButtonText};
                        --ls-colors-buttonTextColor: ${themeData.buttonTextColor};
                        --ls-colors-text-placeholder: ${themeData.placeholderText};
                        --ls-colors-primary-text: ${themeData.primary?.text};
                        --ls-colors-primary-text-muted: ${themeData.primary?.textMuted};
                        --ls-colors-primary-logoColor: ${themeData.logo};

                        --ls-colors-secondary: ${themeData.secondary?.DEFAULT};
                        --ls-colors-secondary-50: ${themeData.secondary?.[50]};
                        --ls-colors-secondary-100: ${themeData.secondary?.[100]};
                        --ls-colors-secondary-200: ${themeData.secondary?.[200]};
                        --ls-colors-secondary-300: ${themeData.secondary?.[300]};
                        --ls-colors-secondary-400: ${themeData.secondary?.[400]};
                        --ls-colors-secondary-500: ${themeData.secondary?.[500]};
                        --ls-colors-secondary-600: ${themeData.secondary?.[600]};
                        --ls-colors-secondary-700: ${themeData.secondary?.[700]};
                        --ls-colors-secondary-800: ${themeData.secondary?.[800]};
                        --ls-colors-secondary-900: ${themeData.secondary?.[900]};
                        --ls-colors-secondary-950: ${themeData.secondary?.[950]};
                        --ls-colors-secondary-text: ${themeData.secondary?.text};
                    }
                    .headerLogo {
                        display: ${themeData.headerLogo};
                    }
                    .footerLogo {
                        display: ${themeData.footerLogo};
                        height: ${themeData.footerLogoHeight};
                    }
                `}
                </style>
            }
        </>
    )
}
export default ColorSchema