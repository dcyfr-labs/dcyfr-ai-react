/**
 * Form Handling - Complete Form Examples with Validation
 * 
 * Demonstrates:
 * - Complex form with Zod validation
 * - Multi-step forms
 * - File upload forms
 * - Dynamic field arrays
 * - Async validation (username availability)
 * - Error handling and display
 */

import { useState, useCallback } from 'react';
import { z } from 'zod';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

// User registration schema
const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  age: z.coerce.number().min(18, 'Must be at least 18 years old'),
  terms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

// Profile update schema
const profileSchema = z.object({
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  avatar: z.instanceof(File).optional(),
  socialLinks: z.array(z.object({
    platform: z.enum(['twitter', 'github', 'linkedin']),
    url: z.string().url('Invalid URL'),
  })),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// =============================================================================
// FORM UTILITIES
// =============================================================================

type FormErrors<T> = {
  [K in keyof T]?: string;
};

function validateWithZod<T>(schema: z.ZodSchema<T>, data: any): {
  success: boolean;
  data?: T;
  errors?: FormErrors<T>;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: FormErrors<T> = {};
  result.error.issues.forEach((err) => {
    const path = err.path.join('.') as keyof T;
    errors[path] = err.message;
  });

  return { success: false, errors };
}

// =============================================================================
// REGISTRATION FORM EXAMPLE
// =============================================================================

export function RegistrationForm() {
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    age: 0,
    terms: false,
  });
  
  const [errors, setErrors] = useState<FormErrors<RegistrationFormData>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const handleChange = useCallback((field: keyof RegistrationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((field: keyof RegistrationFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    // Validate single field on blur
    const result = registrationSchema.shape[field as keyof typeof registrationSchema.shape]?.safeParse(formData[field]);
    
    if (result && !result.success) {
      setErrors((prev) => ({
        ...prev,
        [field]: result.error.issues[0]?.message,
      }));
    }
  }, [formData]);

  // Async username availability check
  const checkUsernameAvailability = useCallback(async (username: string) => {
    setIsCheckingUsername(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const isAvailable = username !== 'admin'; // Mock check
      
      if (!isAvailable) {
        setErrors((prev) => ({
          ...prev,
          username: 'Username is already taken',
        }));
      }
    } finally {
      setIsCheckingUsername(false);
    }
  }, []);

  const handleUsernameBlur = useCallback(() => {
    handleBlur('username');
    if (formData.username && formData.username.length >= 3) {
      checkUsernameAvailability(formData.username);
    }
  }, [formData.username, handleBlur, checkUsernameAvailability]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => ({
      ...acc,
      [key]: true,
    }), {});
    setTouched(allTouched);

    // Validate entire form
    const validation = validateWithZod(registrationSchema, formData);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Registration successful:', validation.data);
      alert('Registration successful!');
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Create Account</h2>

      {/* Name fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium">
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
          {touched.firstName && errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium">
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
          {touched.lastName && errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email *
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          className="mt-1 block w-full rounded border px-3 py-2"
        />
        {touched.email && errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Username with async validation */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium">
          Username *
        </label>
        <div className="relative">
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            onBlur={handleUsernameBlur}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
          {isCheckingUsername && (
            <span className="absolute right-3 top-3">Checking...</span>
          )}
        </div>
        {touched.username && errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username}</p>
        )}
      </div>

      {/* Password fields */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password *
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          className="mt-1 block w-full rounded border px-3 py-2"
        />
        {touched.password && errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium">
          Confirm Password *
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          className="mt-1 block w-full rounded border px-3 py-2"
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Age */}
      <div>
        <label htmlFor="age" className="block text-sm font-medium">
          Age *
        </label>
        <input
          id="age"
          type="number"
          value={formData.age || ''}
          onChange={(e) => handleChange('age', Number(e.target.value))}
          onBlur={() => handleBlur('age')}
          className="mt-1 block w-full rounded border px-3 py-2"
        />
        {touched.age && errors.age && (
          <p className="mt-1 text-sm text-red-600">{errors.age}</p>
        )}
      </div>

      {/* Terms checkbox */}
      <div className="flex items-start">
        <input
          id="terms"
          type="checkbox"
          checked={formData.terms || false}
          onChange={(e) => handleChange('terms', e.target.checked)}
          className="mt-1 h-4 w-4 rounded"
        />
        <label htmlFor="terms" className="ml-2 text-sm">
          I agree to the terms and conditions *
        </label>
      </div>
      {touched.terms && errors.terms && (
        <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || isCheckingUsername}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}

// =============================================================================
// MULTI-STEP FORM EXAMPLE
// =============================================================================

type Step1Data = {
  email: string;
  password: string;
};

type Step2Data = {
  firstName: string;
  lastName: string;
};

type Step3Data = {
  bio: string;
  avatar?: File;
};

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data>>({});

  const handleNext = useCallback((stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    setCurrentStep((prev) => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  const handleSubmit = useCallback(async (stepData: any) => {
    const finalData = { ...formData, ...stepData };
    console.log('Final form data:', finalData);
    alert('Multi-step form submitted!');
  }, [formData]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 ${
                step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
              } ${step !== 1 ? 'ml-2' : ''}`}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Step {currentStep} of 3
        </p>
      </div>

      {/* Step content */}
      {currentStep === 1 && <Step1 onNext={handleNext} initialData={formData} />}
      {currentStep === 2 && <Step2 onNext={handleNext} onBack={handleBack} initialData={formData} />}
      {currentStep === 3 && <Step3 onSubmit={handleSubmit} onBack={handleBack} initialData={formData} />}
    </div>
  );
}

function Step1({ onNext, initialData }: { onNext: (data: Step1Data) => void; initialData: any }) {
  const [data, setData] = useState<Step1Data>({
    email: initialData.email || '',
    password: initialData.password || '',
  });
  const [errors, setErrors] = useState<FormErrors<Step1Data>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    const validation = validateWithZod(schema, data);
    if (!validation.success) {
      setErrors(validation.errors || {});
      return;
    }

    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Account Credentials</h2>
      
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className="mt-1 block w-full rounded border px-3 py-2"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          className="mt-1 block w-full rounded border px-3 py-2"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 text-white">
        Next
      </button>
    </form>
  );
}

function Step2({ onNext, onBack, initialData }: { 
  onNext: (data: Step2Data) => void; 
  onBack: () => void;
  initialData: any;
}) {
  const [data, setData] = useState<Step2Data>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
  });
  const [errors, setErrors] = useState<FormErrors<Step2Data>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const schema = z.object({
      firstName: z.string().min(2),
      lastName: z.string().min(2),
    });

    const validation = validateWithZod(schema, data);
    if (!validation.success) {
      setErrors(validation.errors || {});
      return;
    }

    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Personal Information</h2>
      
      <div>
        <label className="block text-sm font-medium">First Name</label>
        <input
          type="text"
          value={data.firstName}
          onChange={(e) => setData({ ...data, firstName: e.target.value })}
          className="mt-1 block w-full rounded border px-3 py-2"
        />
        {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Last Name</label>
        <input
          type="text"
          value={data.lastName}
          onChange={(e) => setData({ ...data, lastName: e.target.value })}
          className="mt-1 block w-full rounded border px-3 py-2"
        />
        {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="flex-1 rounded border px-4 py-2">
          Back
        </button>
        <button type="submit" className="flex-1 rounded bg-blue-600 px-4 py-2 text-white">
          Next
        </button>
      </div>
    </form>
  );
}

function Step3({ onSubmit, onBack, initialData }: { 
  onSubmit: (data: Step3Data) => void; 
  onBack: () => void;
  initialData: any;
}) {
  const [data, setData] = useState<Step3Data>({
    bio: initialData.bio || '',
    avatar: initialData.avatar,
  });
  const [errors, setErrors] = useState<FormErrors<Step3Data>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const schema = z.object({
      bio: z.string().max(500),
      avatar: z.instanceof(File).optional(),
    });

    const validation = validateWithZod(schema, data);
    if (!validation.success) {
      setErrors(validation.errors || {});
      return;
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Profile Details</h2>
      
      <div>
        <label className="block text-sm font-medium">Bio</label>
        <textarea
          value={data.bio}
          onChange={(e) => setData({ ...data, bio: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded border px-3 py-2"
        />
        <p className="mt-1 text-sm text-gray-500">{data.bio.length}/500 characters</p>
        {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Avatar</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setData({ ...data, avatar: e.target.files?.[0] })}
          className="mt-1 block w-full"
        />
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="flex-1 rounded border px-4 py-2">
          Back
        </button>
        <button type="submit" className="flex-1 rounded bg-blue-600 px-4 py-2 text-white">
          Submit
        </button>
      </div>
    </form>
  );
}
