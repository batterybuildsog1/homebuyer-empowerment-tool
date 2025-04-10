
import { useEffect } from "react";
import { toast } from "sonner";
import { useMortgage } from "@/context/MortgageContext";

interface DataFetchingManagerProps {
  checkDataReadiness: () => boolean;
  cachedDataExists: boolean;
}

const DataFetchingManager: React.FC<DataFetchingManagerProps> = ({
  checkDataReadiness,
  cachedDataExists
}) => {
  const { userData, updateLoanDetails } = useMortgage();

  // Check for cached data on component mount
  useEffect(() => {
    // Check if we need to load data from localStorage
    const cachedData = localStorage.getItem("cached_loan_data");
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        
        // Check if we have valid data in the cache
        const hasValidData = parsedData.conventionalInterestRate !== null || 
                            parsedData.fhaInterestRate !== null || 
                            parsedData.propertyTax !== null || 
                            parsedData.propertyInsurance !== null;
        
        // If we have cached data but it's not in userData yet, update it
        if (hasValidData && 
            !userData.loanDetails.conventionalInterestRate && 
            !userData.loanDetails.fhaInterestRate) {
          console.log("Loading cached loan data into context", parsedData);
          updateLoanDetails(parsedData);
        }
      } catch (e) {
        console.error("Error parsing cached loan data", e);
      }
    }
  }, [updateLoanDetails, userData.loanDetails]);

  // Pre-populate form with values from userData
  useEffect(() => {
    // Initial data readiness check
    checkDataReadiness();
  }, []); 

  return null; // This is a non-visual component
};

export default DataFetchingManager;
