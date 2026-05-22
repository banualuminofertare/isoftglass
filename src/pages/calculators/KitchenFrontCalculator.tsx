import { CalculatorWrapper } from '@/components/calculators/shared/CalculatorWrapper';
import { KitchenFrontConfigurator } from '@/components/calculators/kitchen/KitchenFrontConfigurator';

export default function KitchenFrontCalculator() {
  return (
    <CalculatorWrapper>
      <KitchenFrontConfigurator />
    </CalculatorWrapper>
  );
}
