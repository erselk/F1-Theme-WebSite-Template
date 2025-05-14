import { useState, useEffect, useCallback, useMemo } from "react";
import { format, addHours, isBefore, isToday, parseISO, getDay } from 'date-fns';
import { useThemeLanguage } from "@/lib/ThemeLanguageContext"; // Assuming this context provides language
import { 
  getFormattedTimeString,
  getVenueName as getVenueNameHelper,
  getFormattedDate as getFormattedDateHelper,
  getDayOpeningHours,
  getOpeningHourForDate,
  venueNeedsPayment as venueNeedsPaymentHelper,
  isDateTimeValid as isDateTimeValidHelper,
  isNameValid as isNameValidHelper,
  isPhoneValid as isPhoneValidHelper,
  generateHourOptions as generateHourOptionsHelper,
  generateMinuteOptions as generateMinuteOptionsHelper,
  minuteOptions as minuteOptionsHelper
} from './reservationForm.helpers';
import { OPENING_HOURS, getInitialTimeValues } from './reservationForm.config';

export interface VenueOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface UseReservationFormLogicProps {
  initialSelectedVenue: string | null;
  venueOptions: VenueOption[];
  onFormSubmitProp: () => void; // Renamed to avoid conflict
}

export const useReservationFormLogic = ({
  initialSelectedVenue,
  venueOptions,
  onFormSubmitProp,
}: UseReservationFormLogicProps) => {
  const { language, isDark } = useThemeLanguage(); // Assuming language comes from here
  const initialValues = getInitialTimeValues();

  const [currentStep, setCurrentStep] = useState(0);
  const [price, setPrice] = useState(0);
  const [showPrice, setShowPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentRedirect, setShowPaymentRedirect] = useState(false); // This might be local to component if only for a temporary message
  const [showCallPrompt, setShowCallPrompt] = useState(false);
  const [contactStep, setContactStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(initialValues.initialDate);
  const [timeRange, setTimeRange] = useState<[string, string] | null>(initialValues.initialTimeRange);
  const [dateTimeError, setDateTimeError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    venue: initialSelectedVenue || "",
    people: "",
    date: initialValues.initialFormattedDate,
    startHour: initialValues.initialStartHour,
    startMinute: "00",
    endHour: initialValues.initialEndHour,
    endMinute: "00",
    name: "",
    surname: "",
    phone: "",
    duration: initialValues.initialDuration,
  });

  // Update venue when selectedVenue prop changes and skip to people count step
  useEffect(() => {
    if (initialSelectedVenue) {
      setFormData(prev => ({ ...prev, venue: initialSelectedVenue }));
      setCurrentStep(1);
    }
  }, [initialSelectedVenue]);

  // Calculate price based on venue, duration and people count
  useEffect(() => {
    const startTime = timeRange ? timeRange[0] : '';
    const endTime = timeRange ? timeRange[1] : '';
    
    // Only calculate price if relevant step and data is available
    if (currentStep >= 2 && formData.venue && startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`); // Use a fixed date for time comparison
      const end = new Date(`2000-01-01T${endTime}`);
      
      if (end <= start) {
        // setPrice(0); // Optionally reset price if time range is invalid
        // setShowPrice(false);
        return;
      }
      
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      let basePrice = 0;
      if (formData.venue === "f1") {
        if (durationHours <= 1) basePrice = 100;
        else if (durationHours <= 2) basePrice = 200;
        else basePrice = 300; // Assuming max 3 hours based on previous logic, or adjust
      } else if (formData.venue === "vr") {
        basePrice = 50 * Math.ceil(durationHours);
      } else if (formData.venue === "computers") {
        basePrice = 20 * Math.ceil(durationHours);
      }
      
      const peopleCount = parseInt(formData.people) || 1;
      const totalPrice = basePrice * peopleCount;
      
      setFormData(prev => ({ ...prev, duration: Math.ceil(durationHours) }));
      setPrice(totalPrice);
      setShowPrice(totalPrice > 0);
    } else if (currentStep < 2) {
      // Reset price if navigating to steps before date/time selection
      // setPrice(0);
      // setShowPrice(false);
    }
  }, [currentStep, formData.venue, timeRange, formData.people, formData.duration]); // formData.duration added if it can change price independently


  // Translations (can be part of the hook or passed in if they vary more)
  const translations = useMemo(() => ({
    tr: {
      reservation: "Rezervasyon",
      whichVenue: "Hangi alan için rezervasyon yapmak istiyorsunuz?",
      howManyPeople: "Kaç kişi olacaksınız?",
      callForMore: "8 kişiden fazla rezervasyon için lütfen bizi arayın.",
      callNow: "Şimdi Ara",
      goBack: "Geri Dön",
      whenComing: "Ne zaman gelmek istersiniz?",
      startTime: "Başlangıç Saati",
      endTime: "Bitiş Saati",
      totalPrice: "Toplam Ücret",
      confirm: "Onayla",
      contactInfo: "İletişim Bilgileri",
      firstName: "Ad",
      lastName: "Soyad",
      phone: "Telefon Numarası",
      confirmReservation: "Rezervasyonu Onayla",
      selectedVenue: "Seçilen Alan",
      peopleCount: "Kişi Sayısı",
      date: "Tarih",
      time: "Saat",
      fullName: "Ad Soyad",
      contact: "İletişim",
      proceedToPayment: "Ödemeye Geç",
      completeReservation: "Rezervasyonu Tamamla",
      redirectingToPayment: "Ödeme sayfasına yönlendiriliyor...",
      confirmingReservation: "Rezervasyonunuz onaylanıyor...",
      people: "kişi",
      hour: "Saat",
      minuteLabel: "Dakika",
      successTitle: "Rezervasyonunuz Onaylandı!",
      successMessage: "Seçtiğiniz alan ve saat için rezervasyonunuz başarıyla oluşturuldu.",
      earlyArrival: "Rezervasyon saatinizden 10 dakika önce merkezimizde bulunmanızı rica ederiz."
    },
    en: {
      reservation: "Reservation",
      whichVenue: "Which venue would you like to reserve?",
      howManyPeople: "How many people will attend?",
      callForMore: "Please call us for reservations with more than 8 people.",
      callNow: "Call Now",
      goBack: "Go Back",
      whenComing: "When would you like to come?",
      startTime: "Start Time",
      endTime: "End Time",
      totalPrice: "Total Price",
      confirm: "Confirm",
      contactInfo: "Contact Information",
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone Number",
      confirmReservation: "Confirm Reservation",
      selectedVenue: "Selected Venue",
      peopleCount: "Number of People",
      date: "Date",
      time: "Time",
      fullName: "Full Name",
      contact: "Contact",
      proceedToPayment: "Proceed to Payment",
      completeReservation: "Complete Reservation",
      redirectingToPayment: "Redirecting to payment...",
      confirmingReservation: "Confirming your reservation...",
      people: "people",
      hour: "Hour",
      minuteLabel: "Minute",
      successTitle: "Reservation Confirmed!",
      successMessage: "Your reservation for the selected venue and time has been successfully created.",
      earlyArrival: "We kindly request you to arrive at our center 10 minutes before your reservation time."
    }
  }), []);

  const t = useMemo(() => translations[language === 'en' ? 'en' : 'tr'], [translations, language]);
  
  // useEffect for handling ?step=confirmation and localStorage
  useEffect(() => {
    if (typeof window !== "undefined") { // Ensure window is defined (client-side)
      const urlParams = new URLSearchParams(window.location.search);
      const stepParam = urlParams.get('step');
      const savedStep = localStorage.getItem('form_step');
      const lsPaymentError = localStorage.getItem('payment_error');

      if (lsPaymentError) {
        setPaymentError(lsPaymentError);
        // localStorage.removeItem('payment_error'); // Decide when to clear this
      }
      
      if (stepParam === 'confirmation' || savedStep === '4') {
        const savedVenueName = localStorage.getItem('reservation_venue');
        const savedPeople = localStorage.getItem('reservation_people');
        const savedDateRaw = localStorage.getItem('reservation_date_raw');
        const savedStartTime = localStorage.getItem('reservation_startTime');
        const savedEndTime = localStorage.getItem('reservation_endTime');
        const savedFullName = localStorage.getItem('reservation_name'); // Renamed for clarity
        const savedPhone = localStorage.getItem('reservation_phone');
        
        let firstName = '';
        let lastName = '';
        if (savedFullName) {
          const nameParts = savedFullName.split(' ');
          if (nameParts.length > 1) {
            firstName = nameParts.shift() || '';
            lastName = nameParts.join(' ');
          } else {
            firstName = savedFullName;
          }
        }
        
        const getVenueId = (venueName: string | null) => {
          if (!venueName) return '';
          const venue = venueOptions.find(v => v.title === venueName);
          return venue ? venue.id : '';
        };
        
        setFormData(prev => ({
          ...prev,
          venue: initialSelectedVenue || (savedVenueName ? getVenueId(savedVenueName) : prev.venue),
          people: savedPeople || prev.people,
          date: savedDateRaw || prev.date,
          startHour: savedStartTime ? savedStartTime.split(':')[0] : prev.startHour,
          startMinute: savedStartTime ? savedStartTime.split(':')[1] || '00' : prev.startMinute,
          endHour: savedEndTime ? savedEndTime.split(':')[0] : prev.endHour,
          endMinute: savedEndTime ? savedEndTime.split(':')[1] || '00' : prev.endMinute,
          name: firstName || prev.name,
          surname: lastName || prev.surname,
          phone: savedPhone || prev.phone,
        }));
        
        if (savedStartTime && savedEndTime) {
          setTimeRange([savedStartTime, savedEndTime]);
        }
        
        setCurrentStep(4);
        setContactStep(1); 
        
        // Clean up URL and localStorage
        window.history.replaceState({}, document.title, window.location.pathname);
        localStorage.removeItem('form_step');
      }
    }
  }, [initialSelectedVenue, venueOptions, language, setFormData, setCurrentStep, setContactStep, setTimeRange, setPaymentError]);

  // Memoized values
  const checkmarkVariants = useMemo(() => ({
    hidden: { opacity: 0, pathLength: 0 },
    visible: { 
      opacity: 1, 
      pathLength: 1,
      transition: { 
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  }), []);

  const currentOpeningHourForSelectedDate = useMemo(() => getOpeningHourForDate(selectedDate), [selectedDate]);

  // Handler Functions
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const nextStep = useCallback(() => {
    if (currentStep < 4) { // Assuming 4 is the last step (0-indexed for 5 steps)
      setCurrentStep(currentStep + 1);
      setDateTimeError(null);
    }
  }, [currentStep, setCurrentStep, setDateTimeError]);

  const handlePeopleSelect = useCallback((count: number | string) => {
    if (count === '8+') {
      setShowCallPrompt(true);
    } else {
      setFormData(prev => ({ ...prev, people: count.toString() }));
      nextStep();
    }
  }, [setFormData, nextStep, setShowCallPrompt]);

  const handleVenueSelect = useCallback((venueId: string) => {
    setFormData(prev => ({ ...prev, venue: venueId }));
    setTimeout(() => {
      nextStep();
    }, 300); // Auto advance
  }, [setFormData, nextStep]);

  const goToStep = useCallback((step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      if (step === 3) { // Contact step index
        setContactStep(0); // Reset contact sub-step
      }
    }
  }, [currentStep, setCurrentStep, setContactStep]);

  const handleDateTimeSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setDateTimeError(null);

    if (!isDateTimeValidHelper(formData.date, timeRange)) {
      setDateTimeError(t.dateTimeInvalidError || 'Lütfen geçerli bir tarih ve saat aralığı seçin.'); // Use translation
      return;
    }

    const dayOfWeek = getDay(selectedDate);
    const hoursConfig = OPENING_HOURS[dayOfWeek];

    if (!hoursConfig) {
      setDateTimeError(t.openingHoursNotFoundError || 'Seçilen gün için çalışma saati bulunamadı.'); // Use translation
      return;
    }

    const { open, close } = hoursConfig;
    const [startHourStr, startMinuteStr] = (timeRange?.[0] || '00:00').split(':');
    const [endHourStr, endMinuteStr] = (timeRange?.[1] || '00:00').split(':');
    const startTimeNum = parseInt(startHourStr) + parseInt(startMinuteStr) / 60;
    const endTimeNum = parseInt(endHourStr) + parseInt(endMinuteStr) / 60;

    if (startTimeNum < open) {
      setDateTimeError(
        (t.startTimeBeforeOpeningError || 
        `Seçtiğiniz başlangıç saati ({startTime}), o günkü açılış saatimizden ({openingTime}) önce. Lütfen çalışma saatlerimizi kontrol edin.`)
        .replace('{startTime}', timeRange?.[0] || '')
        .replace('{openingTime}', `${String(open).padStart(2, '0')}:00`)
      );
      return;
    }

    if (endTimeNum > close) {
      setDateTimeError(
        (t.endTimeAfterClosingError || 
        `Seçtiğiniz bitiş saati ({endTime}), o günkü kapanış saatimizden ({closingTime}) sonra. Lütfen çalışma saatlerimizi kontrol edin.`)
        .replace('{endTime}', timeRange?.[1] || '')
        .replace('{closingTime}', `${String(close).padStart(2, '0')}:00`)
      );
      return;
    }
    
    if (startTimeNum >= endTimeNum) {
        setDateTimeError(t.startTimeNotBeforeEndTimeError || 'Başlangıç saati, bitiş saatinden önce olmalıdır.'); // Use translation
        return;
    }
    nextStep();
  }, [formData.date, timeRange, selectedDate, setDateTimeError, nextStep, t]);

  const handleContactFieldSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (contactStep < 1) { // Assuming 1 is the last sub-step (0: name, 1: phone)
      setContactStep(contactStep + 1);
    } else {
      nextStep(); // All contact info collected, move to confirmation
    }
  }, [contactStep, setContactStep, nextStep]);

  const makeCall = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.href = 'tel:+905555555555'; // Replace with actual number if needed
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (typeof window !== "undefined") {
        localStorage.removeItem('payment_error');
    }

    const reservationRef = `PDK${Math.random().toString(36).substring(2, 6).toUpperCase()}${Date.now().toString().substring(9, 13)}`;
    const venueName = getVenueNameHelper(formData.venue, venueOptions);
    const formattedDate = getFormattedDateHelper(formData.date, language);
    const formattedTimeRange = timeRange ? `${timeRange[0]} - ${timeRange[1]}` : '';
    const fullName = `${formData.name} ${formData.surname}`;

    if (typeof window !== "undefined") {
        localStorage.setItem('reservation_ref', reservationRef);
        localStorage.setItem('reservation_venue', venueName);
        localStorage.setItem('reservation_name', fullName);
        localStorage.setItem('reservation_date', formattedDate);
        localStorage.setItem('reservation_time', formattedTimeRange);
        localStorage.setItem('reservation_people', formData.people);
        localStorage.setItem('reservation_price', venueNeedsPaymentHelper(formData.venue) ? `${price} TL` : (t.free || 'Ücretsiz'));
        localStorage.setItem('reservation_phone', formData.phone);
        localStorage.setItem('reservation_date_raw', formData.date);
        localStorage.setItem('reservation_startTime', timeRange ? timeRange[0] : '');
        localStorage.setItem('reservation_endTime', timeRange ? timeRange[1] : '');

        const paymentData = {
            orderId: reservationRef,
            eventTitle: { tr: venueName, en: venueName },
            fullName: fullName,
            email: `${formData.phone.replace(/\D/g, '')}@anonymous.user`,
            phone: formData.phone,
            amount: venueNeedsPaymentHelper(formData.venue) ? price * 100 : 0,
            venue: venueName,
            people: formData.people,
            timestamp: new Date().toISOString(),
            eventDate: new Date(formData.date).toISOString(),
            eventLocation: { tr: 'Padok Club', en: 'Padok Club' },
            refNumber: reservationRef,
            date: formData.date,
            startTime: timeRange ? timeRange[0] : '',
            endTime: timeRange ? timeRange[1] : '',
            totalPrice: venueNeedsPaymentHelper(formData.venue) ? price : 0,
            isFree: !venueNeedsPaymentHelper(formData.venue)
        };
        localStorage.setItem('pendingPayment', JSON.stringify(paymentData));

        if (venueNeedsPaymentHelper(formData.venue)) {
            window.location.href = `/payment/paymentbook?ref=${reservationRef}&venue=${encodeURIComponent(venueName)}&name=${encodeURIComponent(fullName)}&date=${encodeURIComponent(formattedDate)}&time=${encodeURIComponent(formattedTimeRange)}&people=${formData.people}&price=${encodeURIComponent(price + " TL")}&phone=${encodeURIComponent(formData.phone)}&dateRaw=${encodeURIComponent(formData.date)}&startTime=${encodeURIComponent(timeRange ? timeRange[0] : '')}&endTime=${encodeURIComponent(timeRange ? timeRange[1] : '')}`;
        } else {
            try {
                // const response = await fetch('/api/bookings/create-free', { // API call commented out for now
                // method: 'POST',
                // headers: { 'Content-Type': 'application/json' },
                // body: JSON.stringify({
                //     refNumber: reservationRef,
                //     name: fullName,
                //     phone: formData.phone,
                //     date: formData.date,
                //     startTime: timeRange ? timeRange[0] : '',
                //     endTime: timeRange ? timeRange[1] : '',
                //     people: parseInt(formData.people, 10) || 1,
                //     venue: venueName
                // })
                // });
                window.location.href = `/payment/paymentbook/confirmed?ref=${reservationRef}&free=true`;
            } catch (error) {
                console.error('Error saving free booking:', error);
                window.location.href = `/payment/paymentbook/confirmed?ref=${reservationRef}&free=true`;
            }
        }
    }
    // onFormSubmitProp(); // Call the original onSubmit passed from parent if needed after all logic
    setIsSubmitting(false); // Should be set based on actual submission success/failure
  }, [formData, price, timeRange, language, venueOptions, setIsSubmitting, onFormSubmitProp, t]);

  const handleDateChange = useCallback((newDate: Date | null) => {
    if (newDate) {
      setSelectedDate(newDate);
      const newDateFormatted = format(newDate, 'yyyy-MM-dd');
      const openHour = getOpeningHourForDate(newDate);
      const { close: closeHour } = getDayOpeningHours(newDate);
      const defaultEndHour = Math.min(openHour + 1, closeHour);

      const newStartTime = `${String(openHour).padStart(2, '0')}:00`;
      const newEndTime = `${String(defaultEndHour).padStart(2, '0')}:00`;

      setTimeRange([newStartTime, newEndTime]);
      setFormData(prev => ({ 
        ...prev, 
        date: newDateFormatted,
        startHour: String(openHour).padStart(2, '0'),
        startMinute: '00',
        endHour: String(defaultEndHour).padStart(2, '0'),
        endMinute: '00',
        duration: Math.max(1, defaultEndHour - openHour)
      }));
      setDateTimeError(null); 
    }
  }, [setSelectedDate, setTimeRange, setFormData, setDateTimeError]);

  const handleAnalogueTimeChange = useCallback((data: { startTime: { hours: number; minutes: number; }; endTime: { hours: number; minutes: number; }; /*currentType: 'start' | 'end'*/ }) => {
    const startTimeStr = `${data.startTime.hours.toString().padStart(2, '0')}:${data.startTime.minutes.toString().padStart(2, '0')}`;
    const endTimeStr = `${data.endTime.hours.toString().padStart(2, '0')}:${data.endTime.minutes.toString().padStart(2, '0')}`;
    
    setTimeRange([startTimeStr, endTimeStr]);
    setFormData(prev => ({
      ...prev,
      startHour: startTimeStr.split(':')[0],
      startMinute: startTimeStr.split(':')[1],
      endHour: endTimeStr.split(':')[0],
      endMinute: endTimeStr.split(':')[1],
      // Recalculate duration based on new analogue time
      duration: (() => {
          const start = new Date(`2000-01-01T${startTimeStr}`);
          const end = new Date(`2000-01-01T${endTimeStr}`);
          if (end > start) {
            return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
          }
          return prev.duration; // or 0 or 1
      })()
    }));
    setDateTimeError(null); 
  }, [setTimeRange, setFormData, setDateTimeError]);

  const handleDropdownTimeChange = useCallback((field: string, value: string) => {
    let newFormData = { ...formData, [field]: value };

    if (field === 'startHour' || field === 'startMinute') {
      const startH = parseInt(newFormData.startHour);
      const startM = parseInt(newFormData.startMinute);
      const { open, close } = getDayOpeningHours(selectedDate); // Get opening/closing for selected date

      let endH = startH + 1; // Default to 1 hour later
      let endM = startM;

      if (endH > close || (endH === close && endM > 0)) { // If 1 hour later exceeds closing time
        endH = close; // Set to closing hour
        endM = 0;     // Set to :00 minute
        // If even closing time is before or at the start time (e.g. start time is closing time)
        // or if the calculated duration is less than a minimum (e.g. 15 mins), adjust further or flag as invalid.
        // For now, we try to set the longest possible duration if 1hr is not possible.
        if (startH > endH || (startH === endH && startM >= endM)) {
            // This case means start time is at or after closing, or makes any duration impossible.
            // Fallback: keep end time same as start time or clear it, validation should prevent submission.
            // Or, try to find the absolute latest possible minute within the same hour if any.
            // This part can become complex. For now, if endH became invalid, we might reset it or rely on validation.
            // Let's try to set it to the maximum possible within closing constraints.
            // If startH is already 'close', then no valid endM can be set other than 00 if startM is 00.
            // This logic aims to provide a sensible default, not to perfectly validate all edge cases here.
             endH = newFormData.endHour; // Revert to old endHour if calc is bad, or set to a safe default.
             endM = newFormData.endMinute;
        }
      }
      
      // Ensure end time is not before start time after adjustment.
      // This can happen if closing time is very soon after start time.
      if (endH < startH || (endH === startH && endM <= startM)){
          // Attempt to set the latest possible time if the 1-hour rule made it invalid.
          // This means the slot is less than 1 hour.
          endH = close; // Maximize to closing hour
          endM = 0; // At :00
          // If start time is already at closing time (e.g., starts at 22:00, closes at 22:00)
          // then this will make startTime = endTime. Validation should catch this.
          if (endH < startH || (endH === startH && endM <= startM)){
            // If still invalid, it implies a very tight window or an invalid start time near closing.
            // For example, if start is 21:45 and close is 22:00. Max end is 22:00.
            // The dropdown options should ideally prevent such selections for start time.
            // If we must set something, set end equal to start and let validation fail.
            endH = startH;
            endM = startM;
          }
      }

      newFormData.endHour = String(endH).padStart(2, '0');
      newFormData.endMinute = String(endM).padStart(2, '0');
    }
    
    setFormData(newFormData);

    if (newFormData.startHour && newFormData.startMinute && newFormData.endHour && newFormData.endMinute) {
      const startTimeStr = `${newFormData.startHour}:${newFormData.startMinute}`;
      const endTimeStr = `${newFormData.endHour}:${newFormData.endMinute}`;
      setTimeRange([startTimeStr, endTimeStr]);
      
      const start = new Date(`2000-01-01T${startTimeStr}`);
      const end = new Date(`2000-01-01T${endTimeStr}`);
      if (end > start) {
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        // Update duration in a separate step to avoid race condition with setFormData
        setFormData(prev => ({...prev, duration: Math.ceil(durationHours)})); 
      } else {
        setFormData(prev => ({...prev, duration: 0})); 
      }
    } else {
      // If any part of the time is missing, clear the time range and duration
      setTimeRange(null);
      setFormData(prev => ({...prev, duration: 0})); 
    }
  }, [formData, setFormData, selectedDate, setTimeRange, getDayOpeningHours]); // Added getDayOpeningHours dependency

  // Constants for UI that don't depend on state directly, or depend on language (t)
  const peopleOptions = useMemo(() => [1, 2, 3, 4, 5, 6, 7, '8+'], []);
  const stepsLabels = useMemo(() => ({
    tr: ['Alan', 'Kişi Sayısı', 'Tarih', 'İletişim', 'Onay'], // Added 'Onay' for step 4
    en: ['Venue', 'People', 'Date', 'Contact', 'Confirm']
  }), []);
  const currentSteps = useMemo(() => stepsLabels[language === 'en' ? 'en' : 'tr'], [stepsLabels, language]);


  // Return states and setters, handlers will be added next
  return {
    // States
    currentStep, 
    price, 
    showPrice, 
    isSubmitting, 
    showPaymentRedirect, 
    showCallPrompt, 
    contactStep, 
    selectedDate, 
    timeRange, 
    dateTimeError, 
    paymentError, 
    formData, 
    // State Setters (return only those needed by the component)
    setShowCallPrompt, // Added for CallPromptModal onClose
    // Derived/Memoized values
    language, 
    isDark, 
    t, 
    checkmarkVariants,
    currentOpeningHourForSelectedDate,
    peopleOptions,
    currentSteps, // Renamed from steps
    // Handlers
    handleChange,
    handlePeopleSelect,
    handleVenueSelect,
    goToStep,
    nextStep,
    handleDateTimeSubmit,
    handleContactFieldSubmit,
    makeCall,
    handleSubmit,
    handleDateChange,
    handleAnalogueTimeChange,
    handleDropdownTimeChange,
    // Prop from parent, to be called by handleSubmit
    onFormSubmitProp 
  };
}; 