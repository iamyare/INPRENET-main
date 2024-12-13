import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',  // disponible en toda la aplicación.
})
export class ValidationService {
  getErrorMessage(errorKey: string, arg1: any) {
    throw new Error('Method not implemented.');
  }

  constructor() { }

  //--------------------------------------------------------
  codigoAfiliacion(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';

      // Si el valor está vacío, retorna null (válido si el campo vacío es permitido)
      if (!value) {
        return null;
      }

      // Validación: Solo letras y números (sin caracteres especiales ni espacios)
      if (!/^[a-zA-Z0-9]+$/.test(value)) {
        return { invalidCharactersCodigo: 'El código solo puede contener letras y números, sin espacios ni caracteres especiales.' };
      }

      // Validación: No debe tener secuencias consecutivas de más de 4 letras o 4 números
      if (/([a-zA-Z])\1{4,}/.test(value)) {
        return { repeatedLettersCodigo: 'El código no debe contener secuencias consecutivas de más de 4 letras iguales.' };
      }
      if (/(\d)\1{4,}/.test(value)) {
        return { repeatedNumbersCodigo: 'El código no debe contener secuencias consecutivas de más de 4 números iguales.' };
      }
      return null;  // Si todo es válido, retorna null
    };
  }

  // Validación de caracteres especiales y secuencias de letras repetidas
  noSpecialCharactersOrSequencesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';

      // Validación: No permitir caracteres especiales no permitidos
      if (/[^a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\s.-]/.test(value)) {
        return { invalidCharacters: true }; // Error si hay caracteres no permitidos
      }

      // Validación: No permitir un espacio al principio del texto
      if (/^\s/.test(value)) {
        return { leadingSpace: true }; // Error si hay un espacio al principio del texto
      }

      // Validación: No permitir más de un punto o puntos consecutivos
      if (value.split('.').length - 1 > 1 || /\.\./.test(value)) {
        return { multipleDots: true }; // Error si hay más de un punto o puntos consecutivos
      }

      // Validación: No permitir más de un espacio consecutivo
      if (/\s{2,}/.test(value)) {
        return { multipleSpaces: true }; // Error si hay más de un espacio consecutivo
      }

      // Validación: No permitir más de un guion o guiones mal posicionados
      if (value.split('-').length - 1 > 1 || /^-/.test(value) || /-$/.test(value) || /--/.test(value)) {
        return { multipleHyphens: true }; // Error si hay más de un guion o guiones consecutivos
      }

      // Validación: No permitir secuencias repetidas de más de dos caracteres iguales
      const regex = /(.)\1{2,}/;
      if (regex.test(value)) {
        return { repeatedSequence: true }; // Error si hay secuencias repetidas de más de dos caracteres
      }
      if (/^\s|\s$/.test(value)) {
        return { leadingOrTrailingSpaceName: true }; // Error si hay un espacio al inicio o al final
      }
      return null; // Sin errores
    };
  }

  //Validacion de Nombres
  namesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';

      // Validación: Solo permitir letras (incluyendo acentos), espacios y guiones
      if (/[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s-]/.test(value)) {
        return { invalidNameCharacters: true }; // Error si hay caracteres no permitidos
      }

      // Validación: No permitir más de un espacio consecutivo
      if (/\s{2,}/.test(value)) {
        return { multipleSpaces: true }; // Error si hay más de un espacio consecutivo
      }

      // Validación: No permitir más de un guion o guiones al principio o al final
      if (value.split('-').length - 1 > 1 || /^-/.test(value) || /-$/.test(value) || /--/.test(value)) {
        return { multipleHyphens: true }; // Error si hay más de un guion o guiones mal posicionados
      }

      // Validación: No permitir secuencias repetidas de más de dos letras iguales
      const regex = /(.)\1{2,}/;
      if (regex.test(value)) {
        return { repeatedSequence: true }; // Error si hay secuencias repetidas de más de dos caracteres
      }

      // Nueva Validación: No permitir espacios al principio o al final del texto
      if (/^\s|\s$/.test(value)) {
        return { leadingOrTrailingSpaceName: true }; // Error si hay un espacio al inicio o al final
      }
      return null; // Sin errores
    };
  }

  //RTN VALIDADOR------------------
  rtnValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';

      // Si el valor está vacío, retorna null (válido si el campo vacío es permitido)
      if (!value) {
        return null;
      }

      // Validación: Debe tener exactamente 14 caracteres
      if (value.length !== 14) {
        return { invalidRTNLength: 'El RTN debe tener exactamente 14 caracteres.' };
      }

      // Validación: Solo debe contener letras y números
      if (!/^[a-zA-Z0-9]+$/.test(value)) {
        return { invalidCharactersRTN: 'El RTN solo debe contener letras y números.' };
      }

      // Validación: No debe haber secuencias repetidas de más de 5 números iguales
      if (/(\d)\1{5,}/.test(value)) {
        return { repeatedNumbersRTN: 'El RTN no debe contener secuencias repetidas de más de 5 números iguales.' };
      }

      // Validación de seguridad contra inyecciones SQL y XSS
      if (/['"%;)(<>\\]/.test(value)) {
        return { invalidSecurityRTN: 'El RTN contiene caracteres no permitidos por motivos de seguridad.' };
      }
      return null;  // Si todo es válido, retorna null
    };
  }

  // Validación para teléfonos y celulares
  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';
      if (!/^\+?[0-9]+$/.test(value)) {
        return { invalidNumber: true };  // Error si hay caracteres no permitidos
      }
      if (value.length > 16) {
        return { maxLengthExceeded: true };  // Error si excede los 16 caracteres
      }
      if (value.length < 8) {
        return { minLengthNotMet: true };  // Error si tiene menos de 8 caracteres
      }
      if (/--/.test(value)) {
        return { multipleHyphens: true };  // Error si hay guiones seguidos
      }
      return null;
    };
  }

  // Validación opcional para teléfonos
  phoneValidatorOptional(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';

      if (!value) {
        return null;  // Si está vacío, no hay error (número opcional)
      }

      // Modificación: Permite solo números, sin signos "+" ni otros caracteres
      if (!/^[0-9]+$/.test(value)) {
        return { invalidNumberOpc: true };  // Error si hay caracteres no permitidos
      }

      if (value.length > 16) {
        return { maxLengthExceededOpc: true };  // Error si excede los 16 caracteres
      }

      if (value.length < 8) {
        return { minLengthNotMetOpc: true };  // Error si tiene menos de 8 caracteres
      }
      return null;
    };
  }
  // Validación de DNI
  dniValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';
      if (!/^\d+$/.test(value)) {
        return { invalidCharactersDNI: 'El DNI solo puede contener números.' };
      }
      if (value.length !== 13) {
        return { invalidDniLength: 'El DNI debe tener exactamente 13 dígitos.' };
      }
      return null;
    };
  }

  // Validación para Número de empleados
  numberValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';
      if (!/^\+?[0-9]+$/.test(value)) {
        return { invalidCharacters: true };  // Error si hay caracteres no permitidos
      }
      if (value.length > 16) {
        return { maxLengthExceeded: true };  // Error si excede los 16 caracteres
      }
      if (Number(value) < 0) {
        return { minValueNotMet: true };  // Error si es menor que 0
      }
      if (/\+\+/.test(value)) {
        return { consecutiveSpecialCharacters: true };  // Error si hay caracteres especiales consecutivos
      }
      return null;
    };
  }

  //Validación para Números de Casas
  houseNumberValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';

      // Validación 1: No permitir espacios en blanco
      if (/\s/.test(value)) {
        return { noSpacesAllowed: true };  // Error si hay espacios en blanco
      }

      // Validación 2: Permitir solo hasta 2 letras en cualquier parte, y el resto números (máximo 6 caracteres)
      if (!/^[a-zA-Z0-9]{1,6}$/.test(value)) {
        return { invalidCharacters: true };  // Error si contiene caracteres especiales
      }

      // Validación 3: Verificar que tenga hasta 2 letras en cualquier parte y el resto números
      const letterCount = (value.match(/[a-zA-Z]/g) || []).length;
      if (letterCount > 2) {
        return { tooManyLetters: true };  // Error si hay más de 2 letras
      }
      return null;  // Si no hay errores, retornar null
    };
  }

  // Validación para Número de acuerdos
  validacionNumeroAcuerdo(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';
      if (/[^a-zA-Z0-9\-\/]/.test(value)) {
        return { invalidCharacters: true };  // Error si hay caracteres no permitidos
      }
      if (value.length > 50) {
        return { maxLengthExceeded: true };  // Error si excede los 50 caracteres
      }
      if (/--/.test(value)) {
        return { multipleHyphens: true };  // Error si hay guiones seguidos
      }
      if (/\/\//.test(value)) {
        return { multipleSlashesAgree: true };  // Error si hay barras seguidas
      }
      if (/(.)\1{3}/.test(value)) {
        return { repeatedCharactersAgree: true };  // Error si hay más de dos letras repetidas
      }
      return null;
    };
  }

  // Validación para Correo Electrónico
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';

      // Validación 1: No permitir espacios en blanco al principio o final
      if (/^\s|\s$/.test(value)) {
        return { leadingOrTrailingSpace: true }; // Error si hay espacios al inicio o al final
      }

      // Validación 2: Validar formato básico de correo electrónico
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return { invalidEmail: true }; // Error si el correo no tiene un formato válido
      }

      // Validación 3: Longitud máxima de 64 caracteres
      if (value.length > 64) {
        return { maxLengthExceeded: true }; // Error si excede los 64 caracteres
      }
      return null; // Si no hay errores, retornar null
    };
  }
  // Validación para Correo Opcional
  emailOptionalValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';

      // Si el campo está vacío, no aplicar ninguna validación
      if (!value) {
        return null; // Campo opcional, si está vacío no hay errores
      }

      // Validación 1: No permitir espacios en blanco al principio o final
      if (/^\s|\s$/.test(value)) {
        return { leadingOrTrailingSpace: true }; // Error si hay espacios al inicio o al final
      }

      // Validación 2: Validar formato básico de correo electrónico
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return { invalidEmail: true }; // Error si el correo no tiene un formato válido
      }

      // Validación 3: Longitud máxima de 64 caracteres
      if (value.length > 64) {
        return { maxLengthExceeded: true }; // Error si excede los 64 caracteres
      }
      return null; // Si no hay errores, retornar null
    };
  }

  //--------------------------------------------
  // Validación para números de mes (1-12)
  monthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || '';

      // Si el valor está vacío, es válido (asumiendo que no es requerido)
      if (!value) {
        return null;
      }

      // Validación: Solo permitir números entre 1 y 12
      const month = Number(value);
      if (isNaN(month) || month < 1 || month > 12) {
        return { invalidMonth: 'El número ingresado no corresponde a un mes válido (1-12).' };
      }

      return null; // Sin errores si el número está entre 1 y 12
    };
  }

  /*|---------------------------------------------------------------|
    |---- FUNCIÓN: Obtener mensajes de error para los controles ----|
    |---------------------------------------------------------------|*/
  getErrorMessages(control: AbstractControl): string[] {
    const messages: string[] = [];

    if (control.hasError('required')) {
      messages.push('Este campo es requerido.');
    }
    if (control.hasError('invalidRTNLength')) {
      messages.push('El RTN debe tener exactamente 14 caracteres.');
    }
    if (control.hasError('invalidCharactersRTN')) {
      messages.push('El RTN está en un formato inválido.');
    }
    if (control.hasError('repeatedNumbersRTN')) {
      messages.push('El RTN no debe contener secuencias repetidas de más de 5 números iguales.');
    }
    if (control.hasError('invalidSecurityRTN')) {
      messages.push('El RTN contiene caracteres no permitidos por motivos de seguridad.');
    }
    if (control.hasError('invalidCharactersCodigo')) {
      messages.push('El código solo puede contener letras y números, sin espacios ni caracteres especiales.');
    }
    if (control.hasError('repeatedLettersCodigo')) {
      messages.push('El código no debe contener secuencias consecutivas de letras iguales.');
    }
    if (control.hasError('repeatedNumbersCodigo')) {
      messages.push('El código no debe contener secuencias consecutivas.');
    }
    if (control.hasError('maxlength')) {
      messages.push('Ha excedido el número máximo de caracteres.');
    }
    if (control.hasError('multipleSpaces')) {
      messages.push('No se permiten espacios consecutivos.');
    }
    if (control.hasError('invalidCharacters')) {
      messages.push('No se permiten caracteres inválidos.');
    }
    if (control.hasError('multipleHyphens')) {
      messages.push('No se permiten guiones consecutivos.');
    }
    if (control.hasError('invalidDniLength')) {
      messages.push('Longitud incorrecta del campo.');
    }
    if (control.hasError('invalidCharactersDNI')) {
      messages.push('Formato inválido. Solo se aceptan números.');
    }
    if (control.hasError('multipleDots')) {
      messages.push('Solo se permite un punto y no debe ser consecutivo.');
    }
    if (control.hasError('email')) {
      messages.push('Correo electrónico inválido.');
    }
    if (control.hasError('invalidNumber')) {
      messages.push('Solo se permiten números o el signo "+" al inicio.');
    }
    //----------------------------------
    if (control.hasError('invalidNumberOpc')) {
      messages.push('El número telefónico solo puede contener dígitos numéricos.');
    }
    if (control.hasError('maxLengthExceededOpc')) {
      messages.push('El número no puede tener más de 16 caracteres.');
    }
    if (control.hasError('minLengthNotMetOpc')) {
      messages.push('El número debe tener al menos 8 caracteres.');
    }
    //----------------------------------
    if (control.hasError('repeatedCharactersAgree')) {
      messages.push('Secuencia de letras inválida.');
    }
    if (control.hasError('minLengthNotMet')) {
      messages.push('Debe tener al menos 8 dígitos.');
    }
    if (control.hasError('invalidNameCharacters')) {
      messages.push('Solo se permiten letras.');
    }
    if (control.hasError('maxLengthExceeded')) {
      messages.push('Ha excedido el número máximo de caracteres.');
    }
    if (control.hasError('repeatedSequence')) {
      messages.push('No se permiten secuencias de letras repetidas.');
    }
    if (control.hasError('minValueNotMet')) {
      messages.push('El valor no puede ser menor a 0.');
    }
    if (control.hasError('multipleSlashesAgree')) {
      messages.push('No se acepta este formato.');
    }
    if (control.hasError('noSpacesAllowed')) {
      messages.push('No se permiten espacios en el número de casa.');
    }
    if (control.hasError('invalidCharacters')) {
      messages.push('Ingrese correctamente.');
    }
    if (control.hasError('tooManyLetters')) {
      messages.push('El número de casa no puede tener más de 2 letras.');
    }
    if (control.hasError('leadingSpace')) {
      messages.push('El campo no debe comenzar con un espacio.');
    }
    if (control.hasError('leadingOrTrailingSpace')) {
      messages.push('El campo no debe tener espacios al principio o al final.');
    }
    if (control.hasError('invalidEmail')) {
      messages.push('El formato del correo no es válido.');
    }
    if (control.hasError('leadingOrTrailingSpaceName')) {
      messages.push('El campo no debe comenzar o terminar con un espacio.');
    }
    if (control.hasError('invalidMonth')) {
      messages.push('El número ingresado no corresponde a un mes válido (1-12).');
    }
    return messages;
  }
}
