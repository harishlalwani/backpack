import {
  BalancesTable,
  BalancesTableContent,
  BalancesTableHead,
  BalancesTableCell,
  BalancesTableRow,
} from "react-xnft";
import {
  TokenContextProvider,
  useTokenMap,
  useVaultMetadata,
  VaultMetadataProvider,
} from "./context";

export const App = () => {
  return (
    <TokenContextProvider>
      <VaultMetadataProvider>
        <VaultTable />
      </VaultMetadataProvider>
    </TokenContextProvider>
  );
};

// TODO add footer to nav to page for vault discovery
const VaultTable: React.VFC = () => {
  const vaults = useVaultMetadata();
  const tokenMap = useTokenMap();

  return (
    <BalancesTable>
      <BalancesTableHead
        title="PsyFinance Vaults"
        iconUrl="https://uploads-ssl.webflow.com/6158e3591ba06d14de4fd0df/61f900784e63439a5a052fed_PsyOptions.svg"
      />
      <BalancesTableContent>
        {Object.keys(vaults)
          .filter(
            (key) =>
              // @ts-ignore delete wen better typing
              !!tokenMap[vaults[key].accounts.vaultOwnershipTokenMint]?.amount
          )
          .map((id) => (
            <VaultBalanceRow key={id} id={id} />
          ))}
      </BalancesTableContent>
    </BalancesTable>
  );
};

// TODO improve holdings and value display
const VaultBalanceRow: React.VFC<{ id: string }> = ({ id }) => {
  const tokenMap = useTokenMap();
  const vaults = useVaultMetadata();
  const vault = vaults[id];
  // @ts-ignore delete wen better typing
  const holdings: string = // @ts-ignore delete wen better typing
    !!tokenMap[vaults[key].accounts.vaultOwnershipTokenMint]?.amount;

  return (
    <BalancesTableRow>
      <BalancesTableCell title={vault.name} subtitle={holdings} />
    </BalancesTableRow>
  );
};
