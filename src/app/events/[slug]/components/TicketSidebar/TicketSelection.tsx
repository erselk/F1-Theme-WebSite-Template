import { LanguageType, useThemeLanguage } from '@/lib/ThemeLanguageContext';

interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  maxPerOrder?: number;
  variant?: 'standard' | 'premium' | 'vip';
  isSoldOut?: boolean;
  isComingSoon?: boolean;
  originalName?: any;
}

interface TicketSelectionProps {
  ticketTypes: TicketType[];
  selectedTickets: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    variant?: string;
    originalName?: any;
  }[];
  formErrors: Record<string, string>;
  updateTicketQuantity: (id: string, action: 'increase' | 'decrease') => void;
  locale: LanguageType;
}

export function TicketSelection({ ticketTypes, selectedTickets, formErrors, updateTicketQuantity, locale }: TicketSelectionProps) {
  const { isDark } = useThemeLanguage();
  const headingColorClass = isDark ? 'text-white' : 'text-very-dark-grey';
  const textColorClass = isDark ? 'text-light-grey' : 'text-slate-700';
  const buttonBgClass = isDark ? 'bg-carbon-grey' : 'bg-gray-200';
  const cardBgClass = isDark ? 'bg-dark-grey' : 'bg-gray-50';
  const borderColorClass = isDark ? 'border-carbon-grey' : 'border-gray-200';

  return (
    <div className="step-select-tickets space-y-3">
      {/* Heading renk düzeltmesi */}
      <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-very-dark-grey'}`}>
        {locale === 'tr' ? 'Bilet Seçin' : 'Select Tickets'}
      </h3>
      
      {/* Mobile optimized ticket display - horizontal row layout */}
      {ticketTypes.length > 0 ? (
        <div className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible">
          {ticketTypes.map((ticket) => (
            <div 
              key={ticket.id}
              className={`flex flex-col justify-between p-2 ${
                ticket.isSoldOut 
                  ? isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-gray-100 border-gray-300'
                  : ticket.isComingSoon 
                    ? isDark 
                      ? 'bg-amber-900/30 border-amber-800/50' 
                      : 'bg-amber-50 border-amber-200'
                    : cardBgClass
              } rounded-lg border ${ticket.isSoldOut || ticket.isComingSoon ? borderColorClass : borderColorClass} min-w-[120px] shrink-0 lg:flex-row lg:items-center lg:min-w-0 lg:shrink lg:p-3 relative ${ticket.isSoldOut || ticket.isComingSoon ? isDark ? 'opacity-80' : 'opacity-95' : ''}`}
            >
              <div className="mb-1.5 lg:mb-0">
                <h4 className={`font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} text-xs truncate`}>{ticket.name}</h4>
                {ticket.description && (
                  <p className={`text-[10px] ${textColorClass} truncate hidden lg:block`}>{ticket.description}</p>
                )}
                <p className="text-electric-blue font-bold mt-0.5 text-xs flex items-center">
                  {ticket.price === 0 ? (locale === 'tr' ? 'Ücretsiz' : 'Free') : (
                    <>
                      {ticket.price} <span className="ml-0.5">₺</span>
                    </>
                  )}
                </p>
              </div>
              
              {/* Bilet durumuna göre farklı içerik gösterimi */}
              {ticket.isSoldOut ? (
                <div className={`flex items-center justify-center rounded-md py-1 px-2 text-xs font-medium ${
                  isDark 
                    ? 'bg-gray-700 text-gray-200' 
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  {locale === 'tr' ? 'Tükendi' : 'Sold Out'}
                </div>
              ) : ticket.isComingSoon ? (
                <div className={`flex items-center justify-center rounded-md py-1 px-2 text-xs font-medium ${
                  isDark 
                    ? 'bg-amber-700/50 text-amber-200' 
                    : 'bg-amber-200/80 text-amber-800'
                }`}>
                  {locale === 'tr' ? 'Yakında' : 'Coming Soon'}
                </div>
              ) : (
                <div className="flex items-center justify-between lg:justify-end lg:space-x-3">
                  <button 
                    type="button" 
                    className={`w-6 h-6 rounded-full ${buttonBgClass} ${headingColorClass} hover:bg-neon-red hover:text-white flex items-center justify-center transition-colors`}
                    onClick={() => updateTicketQuantity(ticket.id, 'decrease')}
                    aria-label={locale === 'tr' ? 'Azalt' : 'Decrease'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <span className={`min-w-6 text-center ${isDark ? 'text-gray-100' : 'text-gray-900'} text-xs`}>
                    {selectedTickets.find(t => t.id === ticket.id)?.quantity || 0}
                  </span>
                  
                  <button 
                    type="button" 
                    className={`w-6 h-6 rounded-full ${buttonBgClass} ${headingColorClass} hover:bg-electric-blue hover:text-white flex items-center justify-center transition-colors`}
                    onClick={() => updateTicketQuantity(ticket.id, 'increase')}
                    aria-label={locale === 'tr' ? 'Arttır' : 'Increase'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-3 rounded-lg border ${borderColorClass} ${cardBgClass} text-center`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className={`${textColorClass} text-xs mb-1`}>
            {locale === 'tr' 
              ? 'Biletler henüz satışa çıkmadı.' 
              : 'Tickets are not available for sale yet.'}
          </p>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-[10px]`}>
            {locale === 'tr' 
              ? 'Lütfen daha sonra tekrar kontrol ediniz.' 
              : 'Please check back later.'}
          </p>
        </div>
      )}
      
      {Object.keys(formErrors).length > 0 && (
        <div className="text-neon-red text-xs mt-1">
          {Object.values(formErrors).map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
} 