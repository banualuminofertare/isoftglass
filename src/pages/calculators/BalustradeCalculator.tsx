import { CalculatorWrapper } from '@/components/calculators/shared/CalculatorWrapper';
import { BalustradeConfigurator } from '@/components/calculators/balustrade/BalustradeConfigurator';

export default function BalustradeCalculator() {
  return (
    <CalculatorWrapper>
      <BalustradeConfigurator />
    </CalculatorWrapper>
  );
}
