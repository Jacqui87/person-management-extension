import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LanguageIcon from "@mui/icons-material/Language"; // MUI icon for a globe

const LanguageToggleButton = () => {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Toggle language between English and Welsh
  const toggleLanguage = () => {
    const newLang = currentLang === "en-GB" ? "cy-GB" : "en-GB";
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
  };

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const nextLangLabel = currentLang === "en-GB" ? "Cymraeg" : "English";

  return (
    <Tooltip title={t("person_editor.language", { lang: nextLangLabel })}>
      <IconButton
        onClick={toggleLanguage}
        aria-label={t("person_editor.language", { lang: nextLangLabel })}
      >
        <LanguageIcon />
        <span>{nextLangLabel}</span>
      </IconButton>
    </Tooltip>
  );
};

export default LanguageToggleButton;
