#!/bin/bash
# ============================================================
# StacksBet Arena - Contract CLI Helper
# ============================================================
# Usage:
#   ./contract-cli.sh <command> [args...]
#
# Commands:
#   create-market <title> <description> <category> <end_blocks> <liquidity_stx>
#   place-bet <market_id> <outcome: 1=YES, 2=NO> <amount_stx>
#   resolve-market <market_id> <outcome: 1=YES, 2=NO, 3=INVALID>
#   get-market <market_id>
#   get-stats
#
# Environment:
#   MNEMONIC - Your 24-word Stacks wallet seed phrase
#   NETWORK  - "mainnet" or "testnet" (default: mainnet)
# ============================================================

set -e

# Contract details
CONTRACT_ADDRESS="SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N"
CONTRACT_NAME="stacksbet-arena"

# Network config
NETWORK="${NETWORK:-mainnet}"
if [ "$NETWORK" = "mainnet" ]; then
  NODE_URL="https://api.mainnet.hiro.so"
  BROADCAST_URL="https://api.mainnet.hiro.so/v2/transactions"
else
  NODE_URL="https://api.testnet.hiro.so"
  BROADCAST_URL="https://api.testnet.hiro.so/v2/transactions"
fi

# Check mnemonic
if [ -z "$MNEMONIC" ]; then
  echo "❌ Error: MNEMONIC environment variable not set"
  echo "   Export your 24-word seed phrase:"
  echo "   export MNEMONIC=\"word1 word2 word3 ... word24\""
  exit 1
fi

# Get keychain info from mnemonic
KEYCHAIN_JSON=$(stx make_keychain "$MNEMONIC" 2>/dev/null)

# Extract private key and address
PRIVATE_KEY=$(echo "$KEYCHAIN_JSON" | jq -r '.keyInfo.privateKey // empty')
SENDER_ADDRESS=$(echo "$KEYCHAIN_JSON" | jq -r '.keyInfo.address // empty')

if [ -z "$PRIVATE_KEY" ] || [ -z "$SENDER_ADDRESS" ]; then
  echo "⚠️  Could not derive keys from mnemonic, using contract address for read-only calls"
  SENDER_ADDRESS="$CONTRACT_ADDRESS"
  PRIVATE_KEY=""
fi
echo "📍 Using address: $SENDER_ADDRESS"
echo "🌐 Network: $NETWORK"
echo "📜 Contract: $CONTRACT_ADDRESS.$CONTRACT_NAME"
echo ""

# Helper: decode Clarity uint from hex response
decode_uint() {
  local hex="$1"
  # Clarity uint starts with 0x01 then 16 bytes (128-bit big-endian)
  if [[ "$hex" =~ ^0x01([0-9a-fA-F]+)$ ]]; then
    local num_hex="${BASH_REMATCH[1]}"
    # Use Python for 128-bit conversion (bash can't handle it)
    python3 -c "print(int('$num_hex', 16))"
  else
    echo "$hex"
  fi
}

# Helper: call read-only function
read_only() {
  local fn_name="$1"
  shift
  local args="$@"
  
  local result=$(curl -s -X POST "$NODE_URL/v2/contracts/call-read/$CONTRACT_ADDRESS/$CONTRACT_NAME/$fn_name" \
    -H "Content-Type: application/json" \
    -d "{\"sender\": \"$SENDER_ADDRESS\", \"arguments\": [$args]}")
  
  local value=$(echo "$result" | jq -r '.result // .error // .')
  decode_uint "$value"
}

# Helper: call public function (transaction)
call_contract() {
  local fn_name="$1"
  shift
  local args="$@"
  
  if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: Private key not available. Cannot send transactions."
    exit 1
  fi
  
  echo "🚀 Calling $fn_name..."
  echo "   Args: $args"
  
  # Get current nonce
  local nonce=$(curl -s "$NODE_URL/v2/accounts/$SENDER_ADDRESS" | jq -r '.nonce // 0')
  echo "   Nonce: $nonce"
  
  # Use stx CLI to build and broadcast transaction
  # Fee is in microSTX (10000 = 0.01 STX)
  stx call_contract_func \
    "$CONTRACT_ADDRESS" \
    "$CONTRACT_NAME" \
    "$fn_name" \
    10000 \
    "$nonce" \
    "$PRIVATE_KEY" \
    "$args"
}

# Commands
case "$1" in
  create-market)
    if [ $# -lt 6 ]; then
      echo "Usage: $0 create-market <title> <description> <category> <end_blocks> <liquidity_stx>"
      echo "Example: $0 create-market 'Will BTC hit 100k?' 'Bitcoin price prediction' 'Crypto' 1000 10"
      exit 1
    fi
    
    TITLE="$2"
    DESCRIPTION="$3"
    CATEGORY="$4"
    END_BLOCKS="$5"
    LIQUIDITY_STX="$6"
    
    # Get current tip height
    TIP_HEIGHT=$(curl -s "$NODE_URL/v2/info" | jq -r '.stacks_tip_height')
    END_TIME=$((TIP_HEIGHT + END_BLOCKS))
    RESOLUTION_TIME=$((END_TIME + 1008))  # +7 days
    LIQUIDITY_MICRO=$((LIQUIDITY_STX * 1000000))
    
    echo "📊 Creating market..."
    echo "   Title: $TITLE"
    echo "   End block: $END_TIME (current: $TIP_HEIGHT)"
    echo "   Resolution: $RESOLUTION_TIME"
    echo "   Liquidity: $LIQUIDITY_STX STX ($LIQUIDITY_MICRO μSTX)"
    echo ""
    
    # Format args for Clarity: u"string" for utf8, "string" for ascii, uNNN for uint
    ARGS="u\"$TITLE\", u\"$DESCRIPTION\", \"$CATEGORY\", u\"Manual resolution\", u$END_TIME, u$RESOLUTION_TIME, u$LIQUIDITY_MICRO"
    call_contract "create-market" "$ARGS"
    ;;
    
  place-bet)
    if [ $# -lt 4 ]; then
      echo "Usage: $0 place-bet <market_id> <outcome: 1=YES, 2=NO> <amount_stx>"
      echo "Example: $0 place-bet 1 1 5  # Bet 5 STX on YES for market 1"
      exit 1
    fi
    
    MARKET_ID="$2"
    OUTCOME="$3"
    AMOUNT_STX="$4"
    AMOUNT_MICRO=$((AMOUNT_STX * 1000000))
    
    OUTCOME_NAME="YES"
    [ "$OUTCOME" = "2" ] && OUTCOME_NAME="NO"
    
    echo "🎲 Placing bet..."
    echo "   Market: $MARKET_ID"
    echo "   Outcome: $OUTCOME_NAME"
    echo "   Amount: $AMOUNT_STX STX"
    echo ""
    
    ARGS="u$MARKET_ID, u$OUTCOME, u$AMOUNT_MICRO"
    call_contract "place-bet" "$ARGS"
    ;;
    
  resolve-market)
    if [ $# -lt 3 ]; then
      echo "Usage: $0 resolve-market <market_id> <outcome: 1=YES, 2=NO, 3=INVALID>"
      exit 1
    fi
    
    MARKET_ID="$2"
    OUTCOME="$3"
    
    echo "⚖️ Resolving market $MARKET_ID with outcome $OUTCOME..."
    ARGS="u$MARKET_ID, u$OUTCOME"
    call_contract "resolve-market" "$ARGS"
    ;;
    
  get-market)
    if [ $# -lt 2 ]; then
      echo "Usage: $0 get-market <market_id>"
      exit 1
    fi
    
    MARKET_ID="$2"
    echo "📖 Fetching market $MARKET_ID..."
    read_only "get-market" "\"0x$(printf '%016x' $MARKET_ID)\""
    ;;
    
  get-stats)
    echo "📈 Protocol Stats:"
    echo "   Total Volume: $(read_only 'get-total-volume')"
    echo "   Total Markets: $(read_only 'get-total-markets')"
    echo "   Total Bets: $(read_only 'get-total-bets')"
    ;;
    
  *)
    echo "StacksBet Arena CLI"
    echo ""
    echo "Commands:"
    echo "  create-market <title> <desc> <category> <end_blocks> <liquidity_stx>"
    echo "  place-bet <market_id> <outcome: 1=YES, 2=NO> <amount_stx>"
    echo "  resolve-market <market_id> <outcome: 1=YES, 2=NO, 3=INVALID>"
    echo "  get-market <market_id>"
    echo "  get-stats"
    echo ""
    echo "Setup:"
    echo "  export MNEMONIC=\"your 24-word seed phrase\""
    echo "  export NETWORK=mainnet  # or testnet"
    ;;
esac
