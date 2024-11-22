import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      appearance={{
        elements: {
          card: "shadow-md p-4 border rounded-lg", // Style for the main card
          headerTitle: "text-lg font-semibold text-gray-800", // Style for header title
          formButtonPrimary:
            "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg", // Style for the primary button
        },
      }}
    />
  );
}
