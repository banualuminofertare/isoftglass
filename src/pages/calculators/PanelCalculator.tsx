import { CalculatorWrapper } from '@/components/calculators/shared/CalculatorWrapper';
import { PanelConfigurator } from '@/components/calculators/panel/PanelConfigurator';

export default function PanelCalculator() {
  return (
    <CalculatorWrapper>
      <PanelConfigurator />
    </CalculatorWrapper>
  );
}
