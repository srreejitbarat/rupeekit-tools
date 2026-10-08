export function catalogProblems(source, target) {
  if (typeof target !== 'string' || !target.trim()) return ['empty-translation'];
  const issues = [];
  const slots = value => JSON.stringify((value.match(/ZXQ\d+QXZ/g) || []).sort());
  if (slots(source) !== slots(target)) issues.push('placeholder-mismatch');
  if (/\[(?:RK|आरके|আরকে)_\d+\]|ZXV\d+VXZ|जेडएक्सवी[0-9०-९]+वीएक्सजेड|জেডএক্সভি[0-9০-৯]+ভিএক্সজেড/i.test(target)) issues.push('unresolved-batch-marker');
  return issues;
}
