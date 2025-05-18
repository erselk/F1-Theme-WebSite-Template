import { useState, useEffect, useCallback, useMemo } from "react";
import { format, addHours, isBefore, isToday, parseISO, getDay } from 'date-fns';
import { useThemeLanguage } from "@/lib/ThemeLanguageContext"; // Assuming this context provides language
import simulatorPriceData from '@/data/simulatorPrices.json'; // JSON fiyatlarını import et
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
  title: { tr: string; en: string };
  description: { tr: string; en: string };
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
  const initialValuesFromConfig = getInitialTimeValues();

  const [currentOpeningHourForSelectedDate, setCurrentOpeningHourForSelectedDate] = useState<number>(() => getOpeningHourForDate(initialValuesFromConfig.initialDate));

  const [currentStep, setCurrentStep] = useState(0);
  const [price, setPrice] = useState(0);
  const [showPrice, setShowPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentRedirect, setShowPaymentRedirect] = useState(false); // This might be local to component if only for a temporary message
  const [showCallPrompt, setShowCallPrompt] = useState(false);
  const [contactStep, setContactStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(initialValuesFromConfig.initialDate);
  const [timeRange, setTimeRange] = useState<[string, string] | null>(null);
  const [dateTimeError, setDateTimeError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    venue: initialSelectedVenue || "",
    people: "",
    date: initialValuesFromConfig.initialFormattedDate,
    startHour: "",
    startMinute: "",
    endHour: "",
    endMinute: "",
    name: "",
    surname: "",
    phone: "",
    duration: 0,
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
    
    if (currentStep >= 2 && formData.venue && startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      
      if (end <= start) {
        setPrice(0);
        setShowPrice(false);
        return;
      }
      
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      let basePrice = 0;
      // Önce "computers" ID'si için özel bir kontrol ekleyelim, eğer "gaming_pc" bekleniyorsa.
      const currentVenueId = formData.venue === "computers" ? "gaming_pc" : formData.venue;
      const venuePriceData = simulatorPriceData.simulators.find(sim => sim.id === currentVenueId);

      if (venuePriceData) {
        // Tüm venue'ler için JSON'daki pricePerHour'ı kullan ve süreyle çarp
        basePrice = venuePriceData.pricePerHour * Math.ceil(durationHours);
      } else {
        // Eğer JSON'da venue bulunamazsa veya formData.venue tanımsızsa, basePrice 0 olur.
        // Mevcut hardcoded fallback'leri (aşağıdaki if/else if blokları) kaldırabiliriz.
        // Ancak, "computers" ID'si JSON'da "gaming_pc" olarak geçtiği için bir eşleşme problemi olabilir.
        // Şimdilik eski mantığı yorum satırına alıp, ID eşleşmesine dikkat edeceğimizi belirtelim.
        // Eğer formData.venue === "computers" ise ve JSON'da "gaming_pc" varsa, eşleşme için bunu handle etmeliyiz.
        // Ya da formData.venue değerini JSON ID'leri ile tutarlı hale getirmeliyiz.
        // Örnek: formData.venue "computers" yerine "gaming_pc" olmalı.
        // Şimdilik, doğrudan JSON ID'si ile eşleşme varsayıyorum.
        // Eğer eşleşme olmazsa basePrice 0 kalacak.
      }

      // Eski hardcoded mantık:
      // if (formData.venue === "f1") {
      //   if (durationHours <= 1) basePrice = 100;
      //   else if (durationHours <= 2) basePrice = 200;
      //   else basePrice = 300;
      // } else if (formData.venue === "vr") {
      //   basePrice = 50 * Math.ceil(durationHours);
      // } else if (formData.venue === "computers") { // JSON'da bu ID "gaming_pc"
      //   basePrice = 20 * Math.ceil(durationHours);
      // }
      
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
      earlyArrival: "Rezervasyon saatinizden 10 dakika önce merkezimizde bulunmanızı rica ederiz.",
      dateTimeInvalidError: "Lütfen geçerli bir tarih ve saat aralığı seçin.",
      openingHoursNotFoundError: "Seçilen gün için çalışma saati bulunamadı.",
      startTimeBeforeOpeningError: "Seçtiğiniz başlangıç saati ({startTime}), o günkü açılış saatimizden ({openingTime}) önce. Lütfen çalışma saatlerimizi kontrol edin.",
      endTimeAfterClosingError: "Seçtiğiniz bitiş saati ({endTime}), o günkü kapanış saatimizden ({closingTime}) sonra. Lütfen çalışma saatlerimizi kontrol edin.",
      startTimeNotBeforeEndTimeError: "Başlangıç saati, bitiş saatinden önce olmalıdır.",
      free: "Ücretsiz"
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
      earlyArrival: "We kindly request you to arrive at our center 10 minutes before your reservation time.",
      dateTimeInvalidError: "Please select a valid date and time range.",
      openingHoursNotFoundError: "Opening hours not found for the selected day.",
      startTimeBeforeOpeningError: "The selected start time ({startTime}) is before our opening time ({openingTime}) on that day. Please check our opening hours.",
      endTimeAfterClosingError: "The selected end time ({endTime}) is after our closing time ({closingTime}) on that day. Please check our opening hours.",
      startTimeNotBeforeEndTimeError: "Start time must be before end time.",
      free: "Free"
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
          const venue = venueOptions.find(v => v.title.tr === venueName || v.title.en === venueName);
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setPaymentError(null);

    const venueNeedsPay = venueNeedsPaymentHelper(formData.venue);
    const bookingRef = `REF-${Date.now()}`.slice(0, 12);

    const selectedVenueObject = venueOptions.find(v => v.id === formData.venue);
    const venueNameObject = selectedVenueObject ? selectedVenueObject.title : { tr: "Bilinmeyen Alan", en: "Unknown Venue" };
    // Potentially, if description is also needed as an object:
    // const venueDescriptionObject = selectedVenueObject ? selectedVenueObject.description : { tr: "", en: "" };

    const paymentDataForStorage = {
      orderId: bookingRef,
      refNumber: bookingRef,
      totalAmount: price,
      currency: "TRY",
      customerName: `${formData.name} ${formData.surname}`,
      customerEmail: `anonymous-${Date.now().toString(36)}@padok.com`, // More robust anonymous email
      customerPhone: formData.phone,
      bookingDetails: {
        venueId: formData.venue,
        venueName: venueNameObject, // This is the {tr, en} object
        // description: venueDescriptionObject, // If you plan to use it
        numberOfPeople: formData.people,
        date: formData.date, // Already formatted string like "YYYY-MM-DD"
        startTime: timeRange ? timeRange[0] : "",
        endTime: timeRange ? timeRange[1] : "",
        duration: formData.duration, // in hours
        notes: `Mekan: ${venueNameObject[language as 'tr' | 'en']}, Kişi: ${formData.people}, Zaman: ${timeRange ? `${timeRange[0]} - ${timeRange[1]}` : 'N/A'}`,
      },
      language: language,
      type: 'booking'
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem('pendingPayment', JSON.stringify(paymentDataForStorage));
        localStorage.removeItem('payment_error');
      }

      if (venueNeedsPay) {
        setShowPaymentRedirect(true);
        window.location.href = `/payment?type=booking&ref=${bookingRef}`;
      } else {
        // For free bookings, prepare data for confirmation page
        const freeBookingResultForStorage = {
            success: true,
            orderId: bookingRef, // or paymentDataForStorage.orderId
            message: "Ücretsiz rezervasyon onaylandı (simüle edildi).",
            bookingDetails: paymentDataForStorage.bookingDetails, // Pass along the details
            type: 'booking',
            totalAmount: 0, // Free
            customerName: paymentDataForStorage.customerName
        };
        if (typeof window !== "undefined") {
            localStorage.setItem('paymentResult', JSON.stringify(freeBookingResultForStorage));
        }
        window.location.href = `/confirmation/booking/${bookingRef}?free=true`;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Rezervasyon işlenirken hata oluştu');
      return false;
    }
    // onFormSubmitProp(); // Call only if not redirecting or if it handles state post-redirect
  };

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      const formattedDate = format(date, 'yyyy-MM-dd');
      setCurrentOpeningHourForSelectedDate(getOpeningHourForDate(date));

      setFormData(prev => ({
        ...prev,
        date: formattedDate,
        startHour: "", 
        startMinute: "",
        endHour: "",
        endMinute: "",
        duration: 0
      }));
    } else {
      // Handle null date (e.g., user clears the date picker)
      setSelectedDate(new Date()); // veya bir başlangıç tarihi
      setCurrentOpeningHourForSelectedDate(getOpeningHourForDate(new Date()));
      setFormData(prev => ({
        ...prev,
        date: format(new Date(), 'yyyy-MM-dd'),
        startHour: "",
        startMinute: "",
        endHour: "",
        endMinute: "",
        duration: 0
      }));
    }
    setTimeRange(null);
    setDateTimeError(null);
  }, [getOpeningHourForDate]);

  const handleDropdownTimeChange = useCallback((field: string, value: string) => {
    // Ensure field is one of the expected types for safety, although ReservationForm should pass correct ones.
    const type = field as 'startHour' | 'startMinute' | 'endHour' | 'endMinute';
    
    setFormData(prev => {
      const newFormData = { ...prev, [type]: value };

      if ((type === 'startHour' || type === 'startMinute') && newFormData.startHour && newFormData.startMinute) {
        try {
          const startDateObj = parseISO(newFormData.date);
          const startHourInt = parseInt(newFormData.startHour, 10);
          const startMinuteInt = parseInt(newFormData.startMinute, 10);

          if (!isNaN(startHourInt) && !isNaN(startMinuteInt) && startHourInt >= 0 && startHourInt <= 23 && startMinuteInt >= 0 && startMinuteInt <= 59) {
            const startDateTime = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), startDateObj.getDate(), startHourInt, startMinuteInt);
            let endDateTime = addHours(startDateTime, 1);
            const { close: closingHour } = getDayOpeningHours(selectedDate);

            if (endDateTime.getHours() > closingHour || (endDateTime.getHours() === closingHour && endDateTime.getMinutes() > 0)) {
              endDateTime = new Date(startDateTime.getFullYear(), startDateTime.getMonth(), startDateTime.getDate(), closingHour, 0);
            }

            if (isBefore(startDateTime, endDateTime)) {
              newFormData.endHour = String(endDateTime.getHours()).padStart(2, '0');
              newFormData.endMinute = String(endDateTime.getMinutes()).padStart(2, '0');
            } else {
              newFormData.endHour = "";
              newFormData.endMinute = "";
            }
          } else {
            newFormData.endHour = "";
            newFormData.endMinute = "";
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Bitiş saati otomatik ayarlanırken hata oluştu');
          return;
        }
      } else if ((type === 'startHour' || type === 'startMinute') && (!newFormData.startHour || !newFormData.startMinute)) {
        newFormData.endHour = "";
        newFormData.endMinute = "";
      }

      if (newFormData.startHour && newFormData.startMinute && newFormData.endHour && newFormData.endMinute) {
        setTimeRange([`${newFormData.startHour}:${newFormData.startMinute}`, `${newFormData.endHour}:${newFormData.endMinute}`]);
      } else {
        setTimeRange(null);
      }
      return newFormData;
    });
    setDateTimeError(null);
  }, [selectedDate, getDayOpeningHours]);

  const handleAnalogueTimeChange = useCallback((data: { startTime: { hours: number; minutes: number; }; endTime: { hours: number; minutes: number; }; currentType: "end" | "start"; }) => {
    const { startTime, endTime } = data;
    
    const formatTimeValue = (timeVal: { hours: number; minutes: number; }) => {
      return `${String(timeVal.hours).padStart(2, '0')}:${String(timeVal.minutes).padStart(2, '0')}`;
    };

    const startTimeString = formatTimeValue(startTime);
    const endTimeString = formatTimeValue(endTime);

    setFormData(prev => ({
      ...prev,
      startHour: String(startTime.hours).padStart(2, '0'),
      startMinute: String(startTime.minutes).padStart(2, '0'),
      endHour: String(endTime.hours).padStart(2, '0'),
      endMinute: String(endTime.minutes).padStart(2, '0'),
    }));
    setTimeRange([startTimeString, endTimeString]);
    setDateTimeError(null);
  }, []);

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
    handleDropdownTimeChange,
    handleAnalogueTimeChange,
    // Prop from parent, to be called by handleSubmit
    onFormSubmitProp 
  };
}; 