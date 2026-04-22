import { toast } from "sonner";

export const showSuccessToast = (title: string, description?: string) => {
  toast.success(title, {
    description,
    duration: 4000,
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast.error(title, {
    description,
    duration: 5000,
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast.info(title, {
    description,
    duration: 4000,
  });
};

export const showWarningToast = (title: string, description?: string) => {
  toast.warning(title, {
    description,
    duration: 4000,
  });
};

export const showLoadingToast = (title: string, description?: string) => {
  return toast.loading(title, {
    description,
  });
};

export const showActionToast = (
  title: string,
  description: string,
  actionLabel: string,
  onAction: () => void
) => {
  toast.error(title, {
    description,
    action: {
      label: actionLabel,
      onClick: onAction,
    },
    duration: 6000,
  });
};

// Specific error messages for common scenarios
export const showNetworkError = () => {
  showErrorToast(
    "Connection Error",
    "Unable to connect. Please check your internet connection."
  );
};

export const showInsufficientBalanceError = (currentBalance: number) => {
  showErrorToast(
    "Insufficient Pool Balance",
    `Current pool has only ₹${currentBalance.toLocaleString()}. Try a smaller amount.`
  );
};

export const showInvalidInviteError = () => {
  showErrorToast(
    "Invalid Invite Code",
    "This invite code is invalid or has expired."
  );
};

export const showLowTrustScoreError = (requiredScore: number, currentScore: number) => {
  showErrorToast(
    "Trust Score Too Low",
    `You need a trust score of ${requiredScore} or higher. Your current score is ${currentScore}.`
  );
};

export const showAlreadyVotedError = () => {
  showErrorToast(
    "Already Voted",
    "You have already voted on this loan request."
  );
};
