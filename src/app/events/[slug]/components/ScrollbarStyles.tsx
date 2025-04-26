export const ScrollbarStyles = () => {
  return (
    <style jsx global>{`
      /* Custom scrollbar styles for ticket sidebar */
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: var(--dark-grey);
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: var(--carbon-grey);
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: var(--light-grey);
      }
      
      /* For Firefox */
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: var(--carbon-grey) var(--dark-grey);
      }
    `}</style>
  );
};