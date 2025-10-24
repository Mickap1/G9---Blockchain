'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Header } from '@/components/Header';
import SimpleDEXABI from '@/lib/abis/SimpleDEX.json';
import FungibleTokenABI from '@/lib/abis/FungibleAssetToken.json';
import { useIndexerSwaps, useIndexerHealth } from '@/lib/hooks/useIndexer';

const DEX_ADDRESS = '0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98' as `0x${string}`;
const TOKEN_ADDRESS = '0xfA451d9C32d15a637Ab376732303c36C34C9979f' as `0x${string}`;

export default function DEXPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Indexer data
  const { swaps: indexedSwaps, loading: swapsLoading } = useIndexerSwaps(20, 0);
  const { isHealthy: indexerHealthy } = useIndexerHealth();

  // État des réserves du pool
  const [reserveToken, setReserveToken] = useState<string>('0');
  const [reserveETH, setReserveETH] = useState<string>('0');
  const [currentPrice, setCurrentPrice] = useState<string>('0');

  // État des balances utilisateur
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [tokenBalance, setTokenBalance] = useState<string>('0');

  // Formulaires
  const [ethToSwap, setEthToSwap] = useState('');
  const [tokensToSwap, setTokensToSwap] = useState('');
  const [estimatedTokens, setEstimatedTokens] = useState('0');
  const [estimatedETH, setEstimatedETH] = useState('0');

  // Liquidité
  const [ethToAddLiquidity, setEthToAddLiquidity] = useState('');
  const [tokensToAddLiquidity, setTokensToAddLiquidity] = useState('');
  
  // Position LP de l'utilisateur
  const [userLPTokens, setUserLPTokens] = useState<string>('0');
  const [totalLPSupply, setTotalLPSupply] = useState<string>('0');
  const [userSharePercent, setUserSharePercent] = useState<number>(0);
  const [userTokenValue, setUserTokenValue] = useState<string>('0');
  const [userETHValue, setUserETHValue] = useState<string>('0');
  
  // État UI
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity'>('swap');
  const [swapDirection, setSwapDirection] = useState<'ethToToken' | 'tokenToEth'>('ethToToken');
  const [loading, setLoading] = useState(false);

  // Charger les données du pool
  const loadPoolData = async () => {
    if (!publicClient) return;

    try {
      const [resToken, resETH] = await Promise.all([
        publicClient.readContract({
          address: DEX_ADDRESS,
          abi: SimpleDEXABI,
          functionName: 'reserveToken',
        }),
        publicClient.readContract({
          address: DEX_ADDRESS,
          abi: SimpleDEXABI,
          functionName: 'reserveETH',
        }),
      ]);

      const tokenReserve = formatEther(resToken as bigint);
      const ethReserve = formatEther(resETH as bigint);

      setReserveToken(tokenReserve);
      setReserveETH(ethReserve);

      // Calculer le prix (ETH par token)
      if (parseFloat(tokenReserve) > 0) {
        const price = parseFloat(ethReserve) / parseFloat(tokenReserve);
        setCurrentPrice(price.toFixed(8));
      }
    } catch (error) {
      console.error('Error loading pool data:', error);
    }
  };

  // Charger les balances utilisateur
  const loadUserBalances = async () => {
    if (!publicClient || !address) return;

    try {
      const [eth, tokens] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: FungibleTokenABI,
          functionName: 'balanceOf',
          args: [address],
        }),
      ]);

      setEthBalance(formatEther(eth));
      setTokenBalance(formatEther(tokens as bigint));
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  // Charger la position LP de l'utilisateur
  const loadUserLPPosition = async () => {
    if (!publicClient || !address) return;

    try {
      const [lpBalance, poolInfo] = await Promise.all([
        publicClient.readContract({
          address: DEX_ADDRESS,
          abi: SimpleDEXABI,
          functionName: 'liquidity',
          args: [address],
        }) as Promise<bigint>,
        publicClient.readContract({
          address: DEX_ADDRESS,
          abi: SimpleDEXABI,
          functionName: 'getPoolInfo',
        }) as Promise<[bigint, bigint, bigint]>,
      ]);

      const lpTokens = formatEther(lpBalance);
      const [tokenReserve, ethReserve, totalLiquidity] = poolInfo;
      const totalLP = formatEther(totalLiquidity);

      setUserLPTokens(lpTokens);
      setTotalLPSupply(totalLP);

      if (parseFloat(totalLP) > 0) {
        const share = (parseFloat(lpTokens) / parseFloat(totalLP)) * 100;
        setUserSharePercent(share);

        // Calculer la valeur en tokens et ETH que l'utilisateur peut retirer
        const tokenVal = (parseFloat(formatEther(tokenReserve)) * share) / 100;
        const ethVal = (parseFloat(formatEther(ethReserve)) * share) / 100;
        
        setUserTokenValue(tokenVal.toFixed(6));
        setUserETHValue(ethVal.toFixed(6));
      } else {
        setUserSharePercent(0);
        setUserTokenValue('0');
        setUserETHValue('0');
      }
    } catch (error) {
      console.error('Error loading LP position:', error);
    }
  };

  useEffect(() => {
    loadPoolData();
    loadUserBalances();
    loadUserLPPosition();
    const interval = setInterval(() => {
      loadPoolData();
      loadUserBalances();
      loadUserLPPosition();
    }, 10000);
    return () => clearInterval(interval);
  }, [publicClient, address]);

  // Estimer tokens reçus (ETH -> Token)
  useEffect(() => {
    if (ethToSwap && parseFloat(reserveToken) > 0 && parseFloat(reserveETH) > 0) {
      const ethIn = parseFloat(ethToSwap);
      const fee = ethIn * 0.003; // 0.3% fee
      const ethAfterFee = ethIn - fee;
      
      // x * y = k => nouveau y = k / nouveau x
      const k = parseFloat(reserveETH) * parseFloat(reserveToken);
      const newReserveETH = parseFloat(reserveETH) + ethAfterFee;
      const newReserveToken = k / newReserveETH;
      const tokensOut = parseFloat(reserveToken) - newReserveToken;
      
      setEstimatedTokens(tokensOut.toFixed(6));
    } else {
      setEstimatedTokens('0');
    }
  }, [ethToSwap, reserveToken, reserveETH]);

  // Estimer ETH reçu (Token -> ETH)
  useEffect(() => {
    if (tokensToSwap && parseFloat(reserveToken) > 0 && parseFloat(reserveETH) > 0) {
      const tokensIn = parseFloat(tokensToSwap);
      const fee = tokensIn * 0.003;
      const tokensAfterFee = tokensIn - fee;
      
      const k = parseFloat(reserveETH) * parseFloat(reserveToken);
      const newReserveToken = parseFloat(reserveToken) + tokensAfterFee;
      const newReserveETH = k / newReserveToken;
      const ethOut = parseFloat(reserveETH) - newReserveETH;
      
      setEstimatedETH(ethOut.toFixed(6));
    } else {
      setEstimatedETH('0');
    }
  }, [tokensToSwap, reserveToken, reserveETH]);

  // Swap ETH pour Tokens
  const handleSwapETHForTokens = async () => {
    if (!walletClient || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!ethToSwap || parseFloat(ethToSwap) <= 0) {
      alert('Please enter an amount');
      return;
    }

    setLoading(true);
    try {
      const minTokens = (parseFloat(estimatedTokens) * 0.98).toString(); // 2% slippage

      const hash = await walletClient.writeContract({
        address: DEX_ADDRESS,
        abi: SimpleDEXABI,
        functionName: 'swapETHForTokens',
        args: [parseEther(minTokens)],
        value: parseEther(ethToSwap),
      });

      console.log('Transaction hash:', hash);
      console.log('⏳ Waiting for transaction confirmation...');
      
      // Attendre la confirmation de la transaction
      await publicClient?.waitForTransactionReceipt({ hash });
      
      console.log('✅ Transaction confirmed!');
      alert(`✅ Swap réussi!\n\nVous avez échangé ${ethToSwap} ETH contre ~${parseFloat(estimatedTokens).toFixed(4)} tokens.\n\nTransaction: ${hash}`);
      
      setEthToSwap('');
      
      // Recharger les données immédiatement
      await Promise.all([loadPoolData(), loadUserBalances()]);
    } catch (error: any) {
      console.error('Swap error:', error);
      alert(`❌ Erreur: ${error.message || 'Transaction failed'}`);
    } finally {
      setLoading(false);
    }
  };

  // Swap Tokens pour ETH
  const handleSwapTokensForETH = async () => {
    if (!walletClient || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!tokensToSwap || parseFloat(tokensToSwap) <= 0) {
      alert('Please enter an amount');
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Checking current allowance...');
      
      // Vérifier l'allowance actuelle
      const currentAllowance = await publicClient?.readContract({
        address: TOKEN_ADDRESS,
        abi: FungibleTokenABI,
        functionName: 'allowance',
        args: [address, DEX_ADDRESS],
      }) as bigint;

      const amountToSwap = parseEther(tokensToSwap);
      
      console.log('Current allowance:', formatEther(currentAllowance));
      console.log('Amount to swap:', tokensToSwap);

      // N'approuver que si l'allowance actuelle est insuffisante
      if (currentAllowance < amountToSwap) {
        console.log('📝 Step 1/2: Approving tokens...');
        
        // Approuver un montant illimité pour éviter d'avoir à réapprouver à chaque fois
        const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
        
        const approveTx = await walletClient.writeContract({
          address: TOKEN_ADDRESS,
          abi: FungibleTokenABI,
          functionName: 'approve',
          args: [DEX_ADDRESS, maxUint256],
        });

        console.log('Approval hash:', approveTx);
        await publicClient?.waitForTransactionReceipt({ hash: approveTx });
        
        console.log('✅ Tokens approved (unlimited)!');
      } else {
        console.log('✅ Already approved, skipping approval step');
      }
      
      console.log('🔄 Step 2/2: Swapping tokens for ETH...');

      // 2. Swap
      const minETH = (parseFloat(estimatedETH) * 0.98).toString();
      const hash = await walletClient.writeContract({
        address: DEX_ADDRESS,
        abi: SimpleDEXABI,
        functionName: 'swapTokensForETH',
        args: [amountToSwap, parseEther(minETH)],
      });

      console.log('Swap hash:', hash);
      console.log('⏳ Waiting for transaction confirmation...');
      
      // Attendre la confirmation
      await publicClient?.waitForTransactionReceipt({ hash });
      
      console.log('✅ Transaction confirmed!');
      alert(`✅ Swap réussi!\n\nVous avez échangé ${tokensToSwap} tokens contre ~${parseFloat(estimatedETH).toFixed(4)} ETH.\n\nTransaction: ${hash}`);
      
      setTokensToSwap('');
      
      // Recharger les données immédiatement
      await Promise.all([loadPoolData(), loadUserBalances()]);
    } catch (error: any) {
      console.error('Swap error:', error);
      alert(`❌ Erreur: ${error.message || 'Transaction failed'}`);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter de la liquidité
  const handleAddLiquidity = async () => {
    if (!walletClient || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!ethToAddLiquidity || !tokensToAddLiquidity) {
      alert('Please enter amounts for both ETH and Tokens');
      return;
    }

    setLoading(true);
    try {
      // 1. Approuver les tokens
      const approveTx = await walletClient.writeContract({
        address: TOKEN_ADDRESS,
        abi: FungibleTokenABI,
        functionName: 'approve',
        args: [DEX_ADDRESS, parseEther(tokensToAddLiquidity)],
      });

      console.log('Approval hash:', approveTx);
      await publicClient?.waitForTransactionReceipt({ hash: approveTx });

      // 2. Ajouter liquidité
      const hash = await walletClient.writeContract({
        address: DEX_ADDRESS,
        abi: SimpleDEXABI,
        functionName: 'addLiquidity',
        args: [parseEther(tokensToAddLiquidity)],
        value: parseEther(ethToAddLiquidity),
      });

      console.log('Add liquidity hash:', hash);
      await publicClient?.waitForTransactionReceipt({ hash });
      
      alert(`✅ Liquidité ajoutée!\n\nTransaction: ${hash}`);
      
      setEthToAddLiquidity('');
      setTokensToAddLiquidity('');
      await Promise.all([loadPoolData(), loadUserBalances(), loadUserLPPosition()]);
    } catch (error: any) {
      console.error('Add liquidity error:', error);
      alert(`❌ Erreur: ${error.message || 'Transaction failed'}`);
    } finally {
      setLoading(false);
    }
  };

  // Retirer de la liquidité
  const handleRemoveLiquidity = async () => {
    if (!walletClient || !address) {
      alert('Veuillez connecter votre wallet');
      return;
    }

    if (parseFloat(userLPTokens) <= 0) {
      alert('Vous n\'avez pas de liquidité à retirer');
      return;
    }

    const percentToRemove = prompt(
      `Vous avez ${parseFloat(userLPTokens).toFixed(4)} LP tokens.\n\n` +
      `Cela représente:\n` +
      `• ${parseFloat(userTokenValue).toFixed(2)} tokens\n` +
      `• ${parseFloat(userETHValue).toFixed(4)} ETH\n\n` +
      `Quel pourcentage voulez-vous retirer? (1-100)`
    );

    if (!percentToRemove || isNaN(parseFloat(percentToRemove))) {
      return;
    }

    const percent = parseFloat(percentToRemove);
    if (percent <= 0 || percent > 100) {
      alert('Le pourcentage doit être entre 1 et 100');
      return;
    }

    const lpToRemove = (parseFloat(userLPTokens) * percent) / 100;
    const tokensToReceive = (parseFloat(userTokenValue) * percent) / 100;
    const ethToReceive = (parseFloat(userETHValue) * percent) / 100;

    const confirm = window.confirm(
      `Confirmer le retrait de ${percent}% de votre liquidité?\n\n` +
      `Vous allez retirer:\n` +
      `• ${lpToRemove.toFixed(4)} LP tokens\n\n` +
      `Vous recevrez environ:\n` +
      `• ${tokensToReceive.toFixed(2)} tokens\n` +
      `• ${ethToReceive.toFixed(4)} ETH`
    );

    if (!confirm) return;

    setLoading(true);
    try {
      const lpAmount = parseEther(lpToRemove.toString());

      const hash = await walletClient.writeContract({
        address: DEX_ADDRESS,
        abi: SimpleDEXABI,
        functionName: 'removeLiquidity',
        args: [lpAmount],
      });

      console.log('Remove liquidity hash:', hash);
      console.log('⏳ Attente de la confirmation...');
      
      await publicClient?.waitForTransactionReceipt({ hash });
      
      console.log('✅ Transaction confirmée!');
      alert(
        `✅ Liquidité retirée avec succès!\n\n` +
        `Vous avez récupéré:\n` +
        `• ~${tokensToReceive.toFixed(2)} tokens\n` +
        `• ~${ethToReceive.toFixed(4)} ETH\n\n` +
        `Transaction: ${hash}`
      );
      
      await Promise.all([loadPoolData(), loadUserBalances(), loadUserLPPosition()]);
    } catch (error: any) {
      console.error('Remove liquidity error:', error);
      alert(`❌ Erreur: ${error.message || 'Transaction failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🔄 Decentralized Exchange (DEX)
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Automated Market Maker - Prix dynamique basé sur la liquidité du pool
            </p>
          </div>

          {/* Stats du Pool */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Réserve ETH</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {parseFloat(reserveETH).toFixed(4)} ETH
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Réserve Tokens</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {parseFloat(reserveToken).toFixed(2)} TOKENS
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Prix actuel</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currentPrice} ETH/TOKEN
              </div>
            </div>
          </div>

          {/* Vos Balances */}
          {isConnected && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-8">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💼 Vos balances</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-blue-700 dark:text-blue-400">ETH: </span>
                  <span className="font-bold text-blue-900 dark:text-blue-200">
                    {parseFloat(ethBalance).toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-blue-700 dark:text-blue-400">Tokens: </span>
                  <span className="font-bold text-blue-900 dark:text-blue-200">
                    {parseFloat(tokenBalance).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Position LP de l'utilisateur */}
          {isConnected && parseFloat(userLPTokens) > 0 && (
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 mb-8 text-white shadow-lg">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                💧 Votre Position de Liquidité
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-xs opacity-80 mb-1">LP Tokens</div>
                  <div className="text-lg font-bold">{parseFloat(userLPTokens).toFixed(4)}</div>
                </div>
                
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-xs opacity-80 mb-1">Part du Pool</div>
                  <div className="text-lg font-bold">{userSharePercent.toFixed(2)}%</div>
                </div>
                
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-xs opacity-80 mb-1">Tokens Déposés</div>
                  <div className="text-lg font-bold">{parseFloat(userTokenValue).toFixed(2)}</div>
                </div>
                
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-xs opacity-80 mb-1">ETH Déposés</div>
                  <div className="text-lg font-bold">{parseFloat(userETHValue).toFixed(4)}</div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-80">Revenus Estimés</div>
                  <div className="text-xs opacity-70 mt-1">
                    Vous gagnez {userSharePercent.toFixed(2)}% des frais de swap (0.3% par transaction)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-80">Valeur Totale</div>
                  <div className="text-2xl font-bold">
                    {(parseFloat(userTokenValue) + parseFloat(userETHValue) * parseFloat(reserveToken) / parseFloat(reserveETH)).toFixed(2)} TOKENS
                  </div>
                </div>
              </div>

              {/* Bouton pour retirer la liquidité */}
              <div className="mt-4">
                <button
                  onClick={handleRemoveLiquidity}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Traitement...' : '💰 Retirer ma liquidité'}
                </button>
                <p className="text-xs opacity-70 text-center mt-2">
                  Récupérez vos tokens et ETH en échange de vos LP tokens
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('swap')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'swap'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🔄 Swap
            </button>
            <button
              onClick={() => setActiveTab('liquidity')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'liquidity'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              💧 Liquidité
            </button>
          </div>

          {/* Swap Panel */}
          {activeTab === 'swap' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Échanger des tokens
              </h2>

              {/* Direction Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setSwapDirection('ethToToken')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                    swapDirection === 'ethToToken'
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-2 border-orange-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  ETH → Token
                </button>
                <button
                  onClick={() => setSwapDirection('tokenToEth')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                    swapDirection === 'tokenToEth'
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-2 border-orange-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Token → ETH
                </button>
              </div>

              {swapDirection === 'ethToToken' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Montant ETH à échanger
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={ethToSwap}
                      onChange={(e) => setEthToSwap(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0.0"
                    />
                  </div>

                  {parseFloat(estimatedTokens) > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="text-sm text-green-700 dark:text-green-400 mb-1">
                        Vous recevrez environ:
                      </div>
                      <div className="text-2xl font-bold text-green-900 dark:text-green-300">
                        {estimatedTokens} TOKENS
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                        (Fee: 0.3% | Slippage: 2%)
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSwapETHForTokens}
                    disabled={loading || !isConnected || !ethToSwap}
                    className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {loading ? 'Traitement...' : 'Échanger ETH → Token'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Montant de Tokens à échanger
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={tokensToSwap}
                      onChange={(e) => setTokensToSwap(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>

                  {parseFloat(estimatedETH) > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="text-sm text-green-700 dark:text-green-400 mb-1">
                        Vous recevrez environ:
                      </div>
                      <div className="text-2xl font-bold text-green-900 dark:text-green-300">
                        {estimatedETH} ETH
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                        (Fee: 0.3% | Slippage: 2%)
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSwapTokensForETH}
                    disabled={loading || !isConnected || !tokensToSwap}
                    className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {loading ? 'Traitement...' : 'Échanger Token → ETH'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Liquidity Panel */}
          {activeTab === 'liquidity' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ajouter de la liquidité
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Devenez fournisseur de liquidité et gagnez 0.3% de frais sur tous les swaps !
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Montant ETH
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={ethToAddLiquidity}
                    onChange={(e) => setEthToAddLiquidity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Montant Tokens
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={tokensToAddLiquidity}
                    onChange={(e) => setTokensToAddLiquidity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="text-sm text-yellow-800 dark:text-yellow-400">
                    ⚠️ Ratio suggéré: {currentPrice !== '0' ? `1 Token = ${currentPrice} ETH` : 'Pool vide'}
                  </div>
                </div>

                <button
                  onClick={handleAddLiquidity}
                  disabled={loading || !isConnected || !ethToAddLiquidity || !tokensToAddLiquidity}
                  className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Traitement...' : 'Ajouter la liquidité'}
                </button>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
              📖 Comment fonctionne le DEX ?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li>• <strong>AMM (Automated Market Maker)</strong> : Le prix est calculé automatiquement selon la formule x × y = k</li>
              <li>• <strong>Prix dynamique</strong> : Plus vous achetez, plus le prix augmente (et inversement)</li>
              <li>• <strong>Frais de 0.3%</strong> : Redistribués aux fournisseurs de liquidité</li>
              <li>• <strong>Slippage</strong> : Le prix peut varier légèrement pendant la transaction</li>
              <li>• <strong>KYC requis</strong> : Vous devez être whitelisté pour trader</li>
            </ul>
          </div>

          {/* Historique des swaps (depuis l'indexeur) */}
          {indexerHealthy && (
            <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  📊 Historique des Swaps (Temps Réel)
                </h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-300">Indexer actif</span>
                </div>
              </div>

              {swapsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-400 mt-4">Chargement des swaps...</p>
                </div>
              ) : indexedSwaps.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Aucun swap enregistré pour le moment
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">
                          Type
                        </th>
                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">
                          Utilisateur
                        </th>
                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">
                          Montant In
                        </th>
                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">
                          Montant Out
                        </th>
                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">
                          Date
                        </th>
                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">
                          Transaction
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {indexedSwaps.map((swap, index) => (
                        <tr key={index} className="hover:bg-white/5 transition">
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              swap.swapType === 'buy'
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {swap.swapType === 'buy' ? '🔼 Achat' : '🔽 Vente'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm text-gray-300">
                            {swap.user.slice(0, 6)}...{swap.user.slice(-4)}
                          </td>
                          <td className="py-3 px-4 text-white">
                            {parseFloat(formatEther(BigInt(swap.amountIn))).toFixed(4)}
                            <span className="text-xs text-gray-400 ml-1">
                              {swap.swapType === 'buy' ? 'ETH' : 'RWAT'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white">
                            {parseFloat(formatEther(BigInt(swap.amountOut))).toFixed(4)}
                            <span className="text-xs text-gray-400 ml-1">
                              {swap.swapType === 'buy' ? 'RWAT' : 'ETH'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-400">
                            {new Date(swap.timestamp).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <a
                              href={`https://sepolia.etherscan.io/tx/${swap.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-400 hover:text-orange-300 text-sm underline"
                            >
                              Voir ↗
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 text-center">
                  💡 Cette liste se met à jour automatiquement toutes les 60 secondes via l'indexeur blockchain.
                  Les swaps effectués en dehors de cette interface apparaissent également ici.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
