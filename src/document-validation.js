const digits = value => String(value || '').replace(/\D/g, '');

export function validCpf(value) {
  const cpf = digits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const check = length => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) sum += Number(cpf[index]) * (length + 1 - index);
    const remainder = (sum * 10) % 11;
    return Number(cpf[length]) === (remainder === 10 ? 0 : remainder);
  };
  return check(9) && check(10);
}

export function validCnpj(value) {
  const cnpj = digits(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calculate = length => {
    const weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((total, weight, index) => total + Number(cnpj[index]) * weight, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return Number(cnpj[12]) === calculate(12) && Number(cnpj[13]) === calculate(13);
}

export function bindDocumentValidation(input, type = () => digits(input.value).length === 14 ? 'CNPJ' : 'CPF') {
  const validate = () => {
    const selectedType = type();
    const valid = selectedType === 'CNPJ' ? validCnpj(input.value) : validCpf(input.value);
    input.setCustomValidity(valid ? '' : `${selectedType} inválido.`);
  };
  input.addEventListener('input', validate);
  input.addEventListener('blur', validate);
  return validate;
}
