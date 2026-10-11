import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import TaxCalculationService from "@/services/taxCalculationService";
import SequentialTaxCalculationDetails from "@/components/tax/SequentialTaxCalculationDetails";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

const TaxCalculationDetails = ({
  calculation: propCalculation,
  loading: propLoading = false,
  onClose: propOnClose,
}) => {
  const params = useParams();
  const navigate = useNavigate();

  const [fetchedCalculation, setFetchedCalculation] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const isStandalonePage = !propCalculation && Boolean(params.id);

  useEffect(() => {
    if (isStandalonePage && params.id) {
      let cancelled = false;
      setFetchLoading(true);
      setFetchError("");

      TaxCalculationService.getCalculationById(params.id)
        .then((res) => {
          if (cancelled) return;
          if (res?.success && res.data) {
            setFetchedCalculation(res.data);
          } else {
            setFetchError("Tax calculation record not found.");
          }
        })
        .catch((err) => {
          if (cancelled) return;
          setFetchError(err?.response?.data?.message || err?.message || "Failed to load calculation details.");
        })
        .finally(() => {
          if (!cancelled) setFetchLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }
  }, [isStandalonePage, params.id]);

  const calculation = propCalculation || fetchedCalculation;
  const isLoading = propLoading || fetchLoading;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      navigate("/dashboard/tax-calculation-history");
    }
  };

  if (isLoading) {
    return (
      <div
        id="calculation-details"
        className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xs"
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          Loading calculation details...
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-xs">
        <div>
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
          <p className="mt-2 text-sm font-medium text-red-800">{fetchError}</p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calculation History
          </button>
        </div>
      </div>
    );
  }

  if (!calculation) {
    return null;
  }

  return (
    <div id="calculation-details">
      <SequentialTaxCalculationDetails
        calculation={calculation}
        onClose={handleClose}
        showCloseButton={true}
        title=" Tax Calculation Details"
      />
    </div>
  );
};

export default TaxCalculationDetails;
