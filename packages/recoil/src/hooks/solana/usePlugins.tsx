import { useCallback, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  fetchXnft,
  TAB_SET,
  TAB_XNFT,
  UI_RPC_METHOD_NAVIGATION_POP,
  UI_RPC_METHOD_NAVIGATION_PUSH,
} from "@coral-xyz/common";
// XXX: this full path is currently necessary as it avoids loading the jsx in
//      react-xnft-renderer/src/Component.tsx in the background service worker
import { Plugin } from "@coral-xyz/common/dist/esm/plugin";
import { PublicKey } from "@solana/web3.js";
import {
  useRecoilValue,
  useRecoilValueLoadable,
  useSetRecoilState,
} from "recoil";

import * as atoms from "../../atoms";
import { xnftUrl } from "../../atoms/solana/xnft";
import { useConnectionUrls } from "../preferences";
import {
  useActivePublicKeys,
  useBackgroundClient,
  useConnectionBackgroundClient,
  useNavigationSegue,
  useUpdateSearchParams,
} from "../";

import {
  useAnchorContext,
  useSolanaConnectionUrl,
} from "./useSolanaConnection";

export function useAppIcons(publicKey: string) {
  const connectionUrl = useSolanaConnectionUrl();
  const xnftLoadable = useRecoilValueLoadable(
    atoms.filteredPlugins({ publicKey, connectionUrl })
  );
  const xnftData =
    xnftLoadable.state === "hasValue"
      ? (xnftLoadable.contents as Array<any>)
      : [];
  return xnftData;
}

export function usePlugins(publicKey: string): Array<Plugin> | null {
  const connectionUrl = useSolanaConnectionUrl();
  const xnftLoadable = useRecoilValueLoadable(
    atoms.plugins({ publicKey, connectionUrl })
  );

  if (xnftLoadable.state === "hasValue") {
    return xnftLoadable.contents.map((p) => getPlugin(p));
  }
  return null;
}

export function useClosePlugin(): () => void {
  const background = useRecoilValue(atoms.backgroundClient);
  return () => {
    background
      .request({
        method: UI_RPC_METHOD_NAVIGATION_POP,
        params: [TAB_XNFT],
      })
      .catch(console.error);
  };
}

export function useOpenPlugin(): (xnftAddress: string) => void {
  const background = useRecoilValue(atoms.backgroundClient);

  return (xnftAddress) => {
    const url = `xnft/${xnftAddress}`;
    background
      .request({
        method: UI_RPC_METHOD_NAVIGATION_PUSH,
        params: [url, TAB_XNFT],
      })
      .catch(console.error);
  };
}

export function usePluginUrl(address?: string) {
  const { provider } = useAnchorContext();
  const [url, setUrl] = useState<string | null>(null);
  const [cached] = useState<Plugin | undefined>(
    PLUGIN_CACHE.get(address ?? "")
  );

  if (cached) return cached.iframeRootUrl;

  useEffect(() => {
    (async () => {
      if (address) {
        try {
          const xnft = await fetchXnft(provider, new PublicKey(address));
          setUrl(
            xnftUrl(xnft.metadataBlob.xnft.manifest.entrypoints.default.web)
          );
        } catch (error) {
          console.error(error);
        }
      }
    })();
  });

  return url;
}

export function useFreshPlugin(address?: string): {
  state: "loading" | "done" | "error";
  result: Plugin | undefined;
} {
  const { provider } = useAnchorContext();
  const connectionUrls = useConnectionUrls();
  const activePublicKeys = useActivePublicKeys();
  const [result, setResult] = useState<Plugin | undefined>(
    PLUGIN_CACHE.get(address ?? "")
  );
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  //
  // Host APIs to hook into the plugin.
  //
  const segue = useNavigationSegue();
  const setTransactionRequest = useSetRecoilState(atoms.transactionRequest);
  const backgroundClient = useBackgroundClient();
  const connectionBackgroundClient = useConnectionBackgroundClient();
  const openPlugin = useOpenPlugin();

  useEffect(() => {
    if (!address || result) {
      return;
    }
    (async () => {
      try {
        const xnft = await fetchXnft(provider, new PublicKey(address));
        const plugin = new Plugin(
          new PublicKey(address),
          xnft.xnftAccount.publicKey,
          xnftUrl(xnft.metadataBlob.xnft.manifest.entrypoints.default.web),
          xnft.metadataBlob.image,
          xnft.metadataBlob.name,
          activePublicKeys,
          connectionUrls
        );
        plugin.setHostApi({
          push: segue.push,
          pop: segue.pop,
          request: setTransactionRequest,
          backgroundClient,
          connectionBackgroundClient,
          openPlugin,
        });
        PLUGIN_CACHE.set(address, plugin);
        setResult(plugin);
        setState("done");
      } catch (err) {
        setState("error");
      }
    })();
  }, [provider, address]);

  return {
    state,
    result,
  };
}

export function getPlugin(p: any): Plugin {
  let plug = PLUGIN_CACHE.get(p.install.account.xnft.toString());
  if (!plug) {
    plug = new Plugin(
      p.install.account.xnft,
      p.install.publicKey,
      p.url,
      p.iconUrl,
      p.title,
      p.activeWallets,
      p.connectionUrls
    );
    PLUGIN_CACHE.set(p.install.account.xnft.toString(), plug);
  }
  return plug;
}

export function allPlugins(): Array<Plugin> {
  return Array.from(PLUGIN_CACHE.values());
}

const PLUGIN_CACHE = new Map<string, Plugin>();
