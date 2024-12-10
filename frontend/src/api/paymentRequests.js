import apiUrl from '../config';

export const getLastFourDigits = async (paymentIntentId) => {
  const response = await fetch(`${apiUrl}/payment/get-last-four`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ paymentIntentId })
  });

  if (!response.ok) {
    throw new Error('Failed to retrieve card details');
  }

  return await response.json();
};

