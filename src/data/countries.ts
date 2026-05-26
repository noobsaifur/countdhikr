import { SelectedCountry } from '@/types/dhikr';

export const COUNTRIES: SelectedCountry[] = [
  // UAE Emirates
  { name: 'Dubai, UAE', code: 'AE-DU', lat: 25.2048, lng: 55.2708, method: 15 },
  { name: 'Abu Dhabi, UAE', code: 'AE-AZ', lat: 24.4539, lng: 54.3773, method: 8 },
  { name: 'Sharjah, UAE', code: 'AE-SH', lat: 25.3463, lng: 55.4209, method: 8 },
  { name: 'Ajman, UAE', code: 'AE-AJ', lat: 25.4052, lng: 55.5136, method: 8 },
  { name: 'Ras Al Khaimah, UAE', code: 'AE-RK', lat: 25.7953, lng: 55.9432, method: 8 },
  { name: 'Fujairah, UAE', code: 'AE-FU', lat: 25.1288, lng: 56.3265, method: 8 },
  { name: 'Umm Al Quwain, UAE', code: 'AE-UQ', lat: 25.5647, lng: 55.5552, method: 8 },
  
  // Saudi Arabia
  { name: 'Makkah, Saudi Arabia', code: 'SA-MK', lat: 21.4225, lng: 39.8262, method: 4 },
  { name: 'Madinah, Saudi Arabia', code: 'SA-MD', lat: 24.5247, lng: 39.5692, method: 4 },
  { name: 'Riyadh, Saudi Arabia', code: 'SA-RY', lat: 24.7136, lng: 46.6753, method: 4 },
  { name: 'Jeddah, Saudi Arabia', code: 'SA-JD', lat: 21.4858, lng: 39.1925, method: 4 },
  { name: 'Dammam, Saudi Arabia', code: 'SA-DM', lat: 26.4344, lng: 50.1033, method: 4 },
  
  // Gulf Countries
  { name: 'Kuwait City, Kuwait', code: 'KW', lat: 29.3759, lng: 47.9774, method: 9 },
  { name: 'Doha, Qatar', code: 'QA', lat: 25.2854, lng: 51.5310, method: 10 },
  { name: 'Manama, Bahrain', code: 'BH', lat: 26.2285, lng: 50.5860, method: 8 },
  { name: 'Muscat, Oman', code: 'OM', lat: 23.5880, lng: 58.3829, method: 8 },
  
  // Other Middle East
  { name: 'Cairo, Egypt', code: 'EG', lat: 30.0444, lng: 31.2357, method: 5 },
  { name: 'Amman, Jordan', code: 'JO', lat: 31.9454, lng: 35.9284, method: 3 },
  { name: 'Baghdad, Iraq', code: 'IQ', lat: 33.3128, lng: 44.3615, method: 3 },
  { name: 'Damascus, Syria', code: 'SY', lat: 33.5138, lng: 36.2765, method: 3 },
  { name: 'Beirut, Lebanon', code: 'LB', lat: 33.8938, lng: 35.5018, method: 3 },
  { name: 'Jerusalem, Palestine', code: 'PS', lat: 31.7683, lng: 35.2137, method: 3 },
  { name: 'Tehran, Iran', code: 'IR', lat: 35.6892, lng: 51.3890, method: 7 },
  { name: 'Istanbul, Turkey', code: 'TR', lat: 41.0082, lng: 28.9784, method: 13 },
  { name: 'Ankara, Turkey', code: 'TR-AN', lat: 39.9334, lng: 32.8597, method: 13 },
  
  // South Asia
  { name: 'Karachi, Pakistan', code: 'PK-KR', lat: 24.8607, lng: 67.0011, method: 1 },
  { name: 'Lahore, Pakistan', code: 'PK-LH', lat: 31.5204, lng: 74.3587, method: 1 },
  { name: 'Islamabad, Pakistan', code: 'PK-IS', lat: 33.6844, lng: 73.0479, method: 1 },
  { name: 'Dhaka, Bangladesh', code: 'BD', lat: 23.8103, lng: 90.4125, method: 1 },
  { name: 'Mumbai, India', code: 'IN-MU', lat: 19.0760, lng: 72.8777, method: 1 },
  { name: 'Delhi, India', code: 'IN-DL', lat: 28.7041, lng: 77.1025, method: 1 },
  { name: 'Hyderabad, India', code: 'IN-HY', lat: 17.3850, lng: 78.4867, method: 1 },
  
  // Southeast Asia
  { name: 'Kuala Lumpur, Malaysia', code: 'MY', lat: 3.1390, lng: 101.6869, method: 3 },
  { name: 'Singapore', code: 'SG', lat: 1.3521, lng: 103.8198, method: 11 },
  { name: 'Jakarta, Indonesia', code: 'ID', lat: -6.2088, lng: 106.8456, method: 3 },
  { name: 'Brunei', code: 'BN', lat: 4.5353, lng: 114.7277, method: 3 },
  
  // Africa
  { name: 'Casablanca, Morocco', code: 'MA', lat: 33.5731, lng: -7.5898, method: 3 },
  { name: 'Tunis, Tunisia', code: 'TN', lat: 36.8065, lng: 10.1815, method: 3 },
  { name: 'Algiers, Algeria', code: 'DZ', lat: 36.7538, lng: 3.0588, method: 3 },
  { name: 'Lagos, Nigeria', code: 'NG', lat: 6.5244, lng: 3.3792, method: 3 },
  { name: 'Nairobi, Kenya', code: 'KE', lat: -1.2921, lng: 36.8219, method: 3 },
  { name: 'Johannesburg, South Africa', code: 'ZA', lat: -26.2041, lng: 28.0473, method: 3 },
  
  // Europe
  { name: 'London, UK', code: 'GB', lat: 51.5074, lng: -0.1278, method: 3 },
  { name: 'Paris, France', code: 'FR', lat: 48.8566, lng: 2.3522, method: 12 },
  { name: 'Berlin, Germany', code: 'DE', lat: 52.5200, lng: 13.4050, method: 3 },
  { name: 'Amsterdam, Netherlands', code: 'NL', lat: 52.3676, lng: 4.9041, method: 3 },
  { name: 'Brussels, Belgium', code: 'BE', lat: 50.8503, lng: 4.3517, method: 3 },
  { name: 'Moscow, Russia', code: 'RU', lat: 55.7558, lng: 37.6173, method: 14 },
  
  // Americas
  { name: 'New York, USA', code: 'US-NY', lat: 40.7128, lng: -74.0060, method: 2 },
  { name: 'Los Angeles, USA', code: 'US-LA', lat: 34.0522, lng: -118.2437, method: 2 },
  { name: 'Chicago, USA', code: 'US-CH', lat: 41.8781, lng: -87.6298, method: 2 },
  { name: 'Houston, USA', code: 'US-HO', lat: 29.7604, lng: -95.3698, method: 2 },
  { name: 'Toronto, Canada', code: 'CA', lat: 43.6532, lng: -79.3832, method: 2 },
  
  // Australia
  { name: 'Sydney, Australia', code: 'AU-SY', lat: -33.8688, lng: 151.2093, method: 3 },
  { name: 'Melbourne, Australia', code: 'AU-ME', lat: -37.8136, lng: 144.9631, method: 3 },
];
