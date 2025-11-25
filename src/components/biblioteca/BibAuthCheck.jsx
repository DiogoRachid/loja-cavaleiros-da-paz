import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";

export default function BibAuthCheck({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") {
      navigate(createPageUrl("BibLogin"));
    } else {
      setAuthorized(true);
    }
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}