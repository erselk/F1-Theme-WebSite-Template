import { LanguageType, useThemeLanguage } from '@/lib/ThemeLanguageContext';

interface OrderSummaryProps {
  selectedTickets: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    variant?: string;
    originalName?: any;
  }[];
  totalPrice: number;
  locale: LanguageType;
}

export function OrderSummary({ selectedTickets, totalPrice, locale }: OrderSummaryProps) {
  const { isDark } = useThemeLanguage();
  const textColorClass = isDark ? 'text-light-grey' : 'text-slate-700';
  const borderColorClass = isDark ? 'border-carbon-grey' : 'border-gray-200';
  const headingColorClass = isDark ? 'text-white' : 'text-very-dark-grey';

  return (
    <div className="mb-2">
      <h4 className={`text-[10px] font-medium ${textColorClass} mb-1`}>
        {locale === 'tr' ? 'Sipariş Özeti' : 'Order Summary'}
      </h4>
      
      <div className="space-y-0.5 mb-1 text-xs">
        {selectedTickets.map((ticket) => (
          <div key={ticket.id} className="flex justify-between">
            <span className={textColorClass}>{ticket.quantity}x {ticket.name}</span>
            <span className="text-electric-blue flex items-center">
              {ticket.price === 0 ? (locale === 'tr' ? 'Ücretsiz' : 'Free') : (
                <>
                  {ticket.price * ticket.quantity} <span className="ml-1">₺</span>
                </>
              )}
            </span>
          </div>
        ))}
        
        <div className={`border-t ${borderColorClass} pt-1 flex justify-between font-bold ${headingColorClass} text-xs`}>
          <span>{locale === 'tr' ? 'Toplam' : 'Total'}</span>
          <span className="text-neon-green flex items-center">
            {totalPrice} <span className="ml-1">₺</span>
          </span>
        </div>
      </div>
    </div>
  );
} 