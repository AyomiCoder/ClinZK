export function handleApiError(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('not a patient')) {
    return 'Sorry, you are not registered at this clinic. Please check your clinic name and patient number.';
  }

  if (message.includes('revoked')) {
    return 'Your credential has been revoked. Please contact your clinic for more information.';
  }

  if (message.includes('expired')) {
    return 'Your credential has expired. Please contact your clinic to issue a new credential.';
  }

  if (message.includes('not eligible')) {
    return 'You are not eligible for any active clinical trials at this time.';
  }

  if (message.includes('cannot submit another proof yet')) {
    return error.message;
  }

  if (message.includes('cooldown')) {
    return error.message;
  }

  if (message.includes('already exists')) {
    return error.message;
  }

  if (message.includes('did you mean') || message.includes('issuer not found')) {
    return error.message;
  }

  if (message.includes('admin access hash') || message.includes('unauthorized')) {
    return error.message;
  }

  if (message.includes('invalid clinic login id') || message.includes('login id does not match')) {
    return error.message;
  }

  // If the error message looks user-friendly (not a generic error), return it directly
  if (error.message && error.message.length > 0 && !error.message.includes('unexpected') && !error.message.includes('error occurred')) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again later.';
}

