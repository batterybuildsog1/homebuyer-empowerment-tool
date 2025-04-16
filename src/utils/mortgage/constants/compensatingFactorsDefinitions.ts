/**
 * Compensating factors definitions
 * 
 * These are the available compensating factors that can strengthen a mortgage application
 * when DTI ratios exceed standard guidelines.
 */

export const compensatingFactors = {
  cashReserves: {
    label: "Cash Reserves",
    options: ["none", "1-2 months", "3-5 months", "6+ months"],
    description: "Cash reserves available after closing"
  },
  residualIncome: {
    label: "Residual Income",
    options: ["does not meet", "meets VA guidelines"],
    description: "Income remaining after all expenses"
  },
  housingPaymentIncrease: {
    label: "Housing Payment Increase",
    options: ["none", "<10%", "10-20%", ">20%"],
    description: "Increase in housing payment compared to rent"
  },
  employmentHistory: {
    label: "Employment History",
    options: ["<2 years", "2-5 years", "5+ years"],
    description: "Stability of employment"
  },
  creditUtilization: {
    label: "Credit Utilization",
    options: ["none", "<10%", "10-30%", ">30%"],
    description: "Percentage of available credit used"
  },
  downPayment: {
    label: "Down Payment",
    options: ["<5%", "5-10%", "10-20%", "20%+"],
    description: "Down payment percentage"
  }
};
