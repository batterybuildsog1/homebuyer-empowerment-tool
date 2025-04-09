
import { useDataFetching } from "./useDataFetching";
import { useLoanDataCache } from "./useLoanDataCache";
import { useLoanSettings } from "./useLoanSettings";

export const useLoanData = () => {
  // Import all necessary hooks
  const { fetchProgress, fetchExternalData } = useDataFetching();
  const { checkCachedData } = useLoanDataCache();
  const { formData, ltv, currentInterestRate, handleLoanTypeChange, handleDownPaymentChange } = useLoanSettings();

  return {
    formData,
    fetchProgress,
    ltv,
    currentInterestRate,
    handleLoanTypeChange,
    handleDownPaymentChange,
    fetchExternalData
  };
};
