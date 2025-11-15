/**
 * Phone number validation utilities
 * Supports North American phone number formats
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

/**
 * Validates and formats a phone number
 * Accepts formats like:
 * - (555) 123-4567
 * - 555-123-4567
 * - 5551234567
 * - +1 555 123 4567
 * - 1-555-123-4567
 */
export function validatePhoneNumber(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== "string") {
    return {
      isValid: false,
      error: "Phone number is required",
    };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");

  // Check if it starts with 1 (country code) and has 11 digits, or has 10 digits
  if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
    const formatted = formatPhoneNumber(digitsOnly.substring(1));
    return {
      isValid: true,
      formatted: `+1 ${formatted}`,
    };
  } else if (digitsOnly.length === 10) {
    const formatted = formatPhoneNumber(digitsOnly);
    return {
      isValid: true,
      formatted,
    };
  } else {
    return {
      isValid: false,
      error: `Invalid phone number length: expected 10 or 11 digits, got ${digitsOnly.length}`,
    };
  }
}

/**
 * Formats a 10-digit phone number to (XXX) XXX-XXXX format
 */
export function formatPhoneNumber(digits: string): string {
  if (digits.length !== 10) {
    return digits;
  }

  const areaCode = digits.substring(0, 3);
  const prefix = digits.substring(3, 6);
  const lineNumber = digits.substring(6, 10);

  return `(${areaCode}) ${prefix}-${lineNumber}`;
}

/**
 * Generates a random valid phone number for testing/mock data
 */
export function generateRandomPhoneNumber(): string {
  // Generate area code (200-999, avoiding some reserved ranges)
  const areaCodes = [
    201, 202, 203, 205, 206, 207, 208, 209, 210, 212, 213, 214, 215, 216, 217, 218, 219,
    224, 225, 228, 229, 231, 234, 239, 240, 248, 251, 252, 253, 254, 256, 260, 262, 267,
    269, 270, 272, 274, 276, 281, 283, 301, 302, 303, 304, 305, 307, 308, 309, 310, 312,
    313, 314, 315, 316, 317, 318, 319, 320, 321, 323, 325, 330, 331, 334, 336, 337, 339,
    346, 347, 351, 352, 360, 361, 364, 380, 385, 386, 401, 402, 404, 405, 406, 407, 408,
    409, 410, 412, 413, 414, 415, 417, 419, 423, 424, 425, 430, 432, 434, 435, 440, 442,
    443, 458, 463, 469, 470, 475, 478, 479, 480, 484, 501, 502, 503, 504, 505, 507, 508,
    509, 510, 512, 513, 515, 516, 517, 518, 520, 530, 531, 534, 539, 540, 541, 551, 559,
    561, 562, 563, 564, 567, 570, 571, 573, 574, 575, 580, 585, 586, 601, 602, 603, 605,
    606, 607, 608, 609, 610, 612, 614, 615, 616, 617, 618, 619, 620, 623, 626, 628, 629,
    630, 631, 636, 641, 646, 650, 651, 657, 660, 661, 662, 667, 669, 678, 680, 681, 682,
    701, 702, 703, 704, 706, 707, 708, 712, 713, 714, 715, 716, 717, 718, 719, 720, 724,
    725, 727, 731, 732, 734, 737, 740, 743, 747, 754, 757, 760, 762, 763, 765, 769, 770,
    772, 773, 774, 775, 779, 781, 785, 786, 801, 802, 803, 804, 805, 806, 808, 810, 812,
    813, 814, 815, 816, 817, 818, 828, 830, 831, 832, 843, 845, 847, 848, 850, 854, 856,
    857, 858, 859, 860, 862, 863, 864, 865, 870, 872, 878, 901, 903, 904, 906, 907, 908,
    909, 910, 912, 913, 914, 915, 916, 917, 918, 919, 920, 925, 928, 929, 930, 931, 934,
    936, 937, 938, 940, 941, 947, 949, 951, 952, 954, 956, 959, 970, 971, 972, 973, 978,
    979, 980, 984, 985, 989,
  ];

  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];

  // Generate prefix (200-999, avoiding 555 which is reserved for fiction)
  let prefix = Math.floor(Math.random() * 800) + 200;
  if (prefix === 555) {
    prefix = 556;
  }

  // Generate line number (0000-9999)
  const lineNumber = Math.floor(Math.random() * 10000);

  const phoneNumber = `${areaCode}${prefix.toString().padStart(3, "0")}${lineNumber.toString().padStart(4, "0")}`;
  return formatPhoneNumber(phoneNumber);
}

/**
 * Validates a batch of phone numbers
 */
export function validatePhoneNumbers(phones: string[]): Map<string, PhoneValidationResult> {
  const results = new Map<string, PhoneValidationResult>();

  for (const phone of phones) {
    results.set(phone, validatePhoneNumber(phone));
  }

  return results;
}
