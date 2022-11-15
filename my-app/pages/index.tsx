import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import {providers, Contract} from "ethers";
import { useEffect,useRef, useState } from "react";
import {WHITELIST_CONTRACT_ADDRESS, abi} from "../constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(false);
  const web3ModalRef = useRef();


  const getProviderorSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();
    if(chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change the network to Goerli");
    }

    if(needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderorSigner(true);
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      await tx.wait();
      setLoading(false);

      await getNumberofWhitelisted();
      setJoinedWhitelist(true);
    }
    catch (err) {
      console.error(err);
    }
  };

  const getNumberofWhitelisted = async () => {
    try {
      const provider = await getProviderorSigner();
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider);
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    }
    catch (err) {
      console.error(err);
    }
  };

  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderorSigner(true);
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);
    }
    catch (err) {
      console.error(err);
    }
  };
  const connectWallet = async () => {
    try {
      await getProviderorSigner();
      setWalletConnected(true);
      checkIfAddressInWhitelist();
      getNumberofWhitelisted();
    }
    catch (err) {
      console.error(err);
    }
  };

  const renderButton = () => {
    if(walletConnected){
      if(joinedWhitelist) {
        return (
          <div className={styles.description}>Thanks for joining the Whitelist!</div>
        );
      }
        else if (loading) {
          return <button className={styles.button}>Loading...</button>
        }
        else {
          return (
            <button className={styles.button} onClick={addAddressToWhitelist}>Join the Whitelist</button>
          );
        }
      }
    else {
      return (
        <button onClick={connectWallet} className = {styles.button}>Connect your wallet</button>
      );
    
    }
  };
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network:"goerli",
        providerOptions:{},
        disableInjectedProvider:false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist dApp</title>
        <meta name="desciption" content="Whitelist-dApp"/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>It is an NFT Collection for developers in Crypto</div>
          <div className={styles.description}>{numberOfWhitelisted} have already joined the whitelist</div>
          {renderButton()}
        </div>
        <div>
          <img src="./crypto-devs.svg" alt="" className={styles.image} />
        </div>
        
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );

}