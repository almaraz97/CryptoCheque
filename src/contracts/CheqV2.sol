// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.14;
import "openzeppelin/token/ERC721/ERC721.sol";
import "openzeppelin/token/ERC20/IERC20.sol";
import "openzeppelin/access/Ownable.sol";

/* 
Cheq: 
Ownership (mint, transfer, ?burn)
Metadata (cheque struct)
Deposit balances
ProtocolFees
Resolver acceptance

DISALLOW NON-RESOLVER ADDRESSES

Resolver:
Who can write, cash, transfer, void, deposit, and fund cheqs AND
updating relevent internal variables
*/

/* Invariants: 
Cheq struct immutables- token, drawer, recipient, resolver

*/ 

contract Cheq is ERC721, Ownable {

    struct Cheque {
        uint256 amount;  // resolver can modify
        uint256 escrowed;  // resolver can modify
        IERC20 token;
        address drawer;
        address recipient;
        ICheqResolver resolver;  // TODO need to change to uint8 and add lookup table for address->uint8 (reduces storage costs)
    }
    /*//////////////////////////////////////////////////////////////
                           STORAGE VARIABLES
    //////////////////////////////////////////////////////////////*/
    mapping(uint256 => Cheque) public chequeInfo; // Cheque information
    mapping(address => mapping(IERC20 => uint256)) public deposits; // Total user deposits
    uint256 public totalSupply; // Total cheques created
    mapping(ICheqResolver => bool) public resolverWhitelist;
    uint256 public protocolFee; // Fee in native token taken
    uint256 public protocolReserve; // Fee in native token taken
    // uint256 public transferFee; // Fee in native token taken
    // uint256 public writeFee;
    // uint256 public cashFee;

    /*//////////////////////////////////////////////////////////////
                           EVENTS/MODIFIERS
    //////////////////////////////////////////////////////////////*/
    event Deposit(IERC20 indexed _token, address indexed to, uint256 amount);
    event WriteCheque(uint256 indexed tokenId, uint256 amount, uint256 escrowed, IERC20 token, address drawer, address indexed recipient, ICheqResolver indexed resolver); 
    event Cash(address indexed bearer, uint256 indexed tokenId, uint256 cashingAmount);
    event Void(address indexed bearer, uint256 indexed tokenId);

    event SetProtocolFee(uint256 amount);
    event Withdraw(address indexed _address, uint256 amount);  // Protocol fees
    
    modifier onlyResolvers(){require(resolverWhitelist[ICheqResolver(_msgSender())], "Only Resolvers");_;}

    /*//////////////////////////////////////////////////////////////
                        ONLY OWNER FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    constructor() ERC721("CheqProtocol", "CHEQ") {}

    function setFees(uint256 _protocolFee)
        external
        onlyOwner
    {
        protocolFee = _protocolFee;
        emit SetProtocolFee(_protocolFee);
    }
    function withdrawFees(uint256 _amount) external onlyOwner {
        // require(protocolReserve >= _amount, "More than available");
        // unchecked {
        //     protocolReserve -= _amount;
        // }
        // bool success = payable(address(this)).call(
        //     _msgSender(),
        //     _amount
        // );
        // require(success, "Transfer failed.");
        // emit Withdraw(_msgSender(), _amount);
    }
    function changeResolver(ICheqResolver resolver, bool accepted) external onlyOwner {
        resolverWhitelist[resolver] = accepted;
    }
    /*//////////////////////////////////////////////////////////////
                            USER DEPOSITS
    //////////////////////////////////////////////////////////////*/
    function _deposit(
        IERC20 _token,
        address from,
        uint256 _amount
    ) private {
        require(_amount > 0, "Zero deposit");
        require(_token.transferFrom(
            from,
            address(this),
            _amount
        ), "Transfer failed");
        deposits[from][_token] += _amount;
        emit Deposit(_token, from, _amount);
    }

    function deposit(IERC20 _token, uint256 _amount) public onlyResolvers returns (bool) {  // make one external and use other in depositWrite()?
        _deposit(_token, _msgSender(), _amount);
        return true;
    }

    function deposit(
        address from,
        IERC20 _token,
        uint256 _amount
    ) public onlyResolvers returns (bool) {
        _deposit(_token, from, _amount);
        return true;
    }

    /*//////////////////////////////////////////////////////////////
                          ERC-721 OVERRIDES
    //////////////////////////////////////////////////////////////*/
    function _feeOnTransfer(uint256 chequeID) private {  // Reduce escrowed amount on transfer
        // Cheque storage cheque = chequeInfo[chequeID];
        // IERC20 _token = cheque.token;
        // require(cheque.amount >= protocolFee[_token], "too small for transfer");
        // unchecked {
        //     cheque.amount = cheque.amount - protocolFee[_token];
        // }
        // protocolReserve[_token] += protocolFee[_token];
    }

    function transferFrom(
        address from,
        address to,
        uint256 chequeID
    ) public onlyResolvers virtual override {
        require(
            _isApprovedOrOwner(_msgSender(), chequeID),
            "Transfer disallowed"
        );
        _feeOnTransfer(chequeID);  // TODO switch with yield
        _transfer(from, to, chequeID);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 chequeID,
        bytes memory data
    ) public onlyResolvers virtual override {
        require(
            _isApprovedOrOwner(_msgSender(), chequeID),
            "Transfer disallowed"
        );
        _feeOnTransfer(chequeID);  // TODO switch with yield
        _safeTransfer(from, to, chequeID, data);
    }

    /*//////////////////////////////////////////////////////////////
                        ERC-721 FUNCTION USAGE
    //////////////////////////////////////////////////////////////*/
    function _initCheque (
        address drawer,
        IERC20 _token,
        uint256 amount,
        uint256 escrowed,
        address recipient,
        ICheqResolver resolver
        ) private pure returns(Cheque memory){
        return Cheque({
            drawer: drawer,
            recipient: recipient,
            token: _token,
            amount: amount,
            escrowed: escrowed, 
            resolver: resolver
        });
    }

    function writeCheque(
        address from,
        address recipient,
        IERC20 _token,
        uint256 amount,
        uint256 escrowed,
        ICheqResolver resolver,
        address owner
    ) public onlyResolvers
        returns (uint256)
    {
        require(
            amount <= deposits[from][_token],
            "INSUF_BAL"
        );
        deposits[from][_token] -= amount;
        chequeInfo[totalSupply] = _initCheque(from, _token, amount, escrowed, recipient, resolver);
        emit WriteCheque(totalSupply, amount, escrowed, _token, from, recipient, resolver);
        _safeMint(owner, totalSupply);
        totalSupply += 1;
        return totalSupply-1;
    }

    function cashCheque(uint256 chequeID, address to, uint256 cashAmount) external onlyResolvers {
        Cheque storage cheque = chequeInfo[chequeID];  // Delegate all requires to module??
        require(cheque.escrowed>=cashAmount, "");
        cheque.escrowed -= cashAmount;
        require(cheque.token.transfer(to, cashAmount), "Transfer failed");
        emit Cash(to, chequeID, cashAmount);
    }

    function fundCheque(uint256 chequeID, uint256 amount) external onlyResolvers {
        // Allow people to add funding to a cheq if the status allows it
    }//

    function depositWrite(
        address from,
        IERC20 _token,
        uint256 amount,
        uint256 escrowed,
        address recipient,
        ICheqResolver resolver, 
        address owner
        ) external onlyResolvers
        returns (uint256){
        require(deposit(from, _token, amount), "deposit failed");
        return writeCheque(from, recipient, _token, amount, escrowed, resolver, owner);
    }
    function chequeAmount(uint256 chequeId) external view returns (uint256) {
        return chequeInfo[chequeId].amount;
    }

    function chequeToken(uint256 chequeId) external view returns (IERC20) {
        return chequeInfo[chequeId].token;
    }

    function chequeDrawer(uint256 chequeId) external view returns (address) {
        return chequeInfo[chequeId].drawer;
    }

    function chequeRecipient(uint256 chequeId) external view returns (address) {
        return chequeInfo[chequeId].recipient;
    }

    function chequeEscrowed(uint256 chequeId) external view returns (uint256) {
        return chequeInfo[chequeId].escrowed;
    }
}


interface ICheqResolver {
    enum Status{Pending, Cashed, Voided} // Refunded(voided), Spited, Disputing, Frozen, Burnt, Mature
    function isWriteable(address sender, IERC20 _token, uint256 amount, uint256 escrowed, address recipient) external view returns(bool);
    // Checks if caller can write the cheq [INTERFACE: resolver] (isWriteable)
    // Checks if caller has enough balance [Cheq]
    //// Checks if recipient/Cheq allows this resolver [Cheq]
    // Pays auditor [INTERFACE: auditor]
    // Deducts user balance [Cheq]
    // Initializes chequeInfo [Cheq]
    // Emits WriteCheque [Cheq]
    // Mints cheque [Cheq]
    // Calls onWrite() [INTERFACE]
    // Increments totalSupply [Cheq]
    // Returns chequeID (totalsupply) [Cheq]
    // PROTOCOL FEE [Cheq]
    ///// function onWrite(uint256 chequeID, address sender, IERC20 _token, uint256 amount, uint256 escrowed, address recipient) external returns(bool);
    // Updates the resolver contract's variables
    function cashable(uint256 chequeID, address caller) external view returns(uint256);  // How much can be cashed
    // Checks if caller is the owner [INTERFACE: resolver]
    // Checks if is cashable [INTERFACE: resolver]
    // Sets as cashed [CHEQ OR INTERFACE?]
    // Transfers the cashing amount [Cheq]
    // Emits Cash event [Cheq]
    // PROTOCOL FEE [Cheq]
    // AUDITOR FEE [INTERFACE: auditor]
    //// THIS MIGHT NOT NEED TO BE IN [CHEQ] SINCE IT ONLY AFFECTS CASHABLE
    // function isVoidable(uint256 chequeID, address caller) external returns(bool);
    // Checks if caller is auditor [INTERFACE]
    // Checks if check is voidable by auditor []
    // Sets cash status []
    // Pays auditor []
    // Increments balance back to drawer
    // Emits Void event [Cheq]
    // PROTOCOL FEE [Cheq]
    ////function onCash(uint256 chequeID, address caller) external;
    function isTransferable(uint256 chequeID, address caller) external view returns(bool);
    // Checks if caller isOwner 
    // Transfers
    // PROTOCOL FEE [Cheq]
    function isFundable(uint256 chequeID, address caller, uint256 amount) external view returns(bool);
    //// function onTransfer(uint256 chequeID, address caller) external view;
    //// function cheqStatus(uint256 chequeID) external returns(Status);
}


interface IAuditFeeResolver {  // Execute fee or just return it?
    function onWrite() external returns(uint256);
    function onCash() external returns(uint256);
    function onVoid() external returns(uint256);
    function onTransfer() external returns(uint256);
}

contract SelfSignTimeLock is ICheqResolver {  // IDK how ERC721 approval functions figure into this
    Cheq public cheq;
    // struct CheqWrapper {
    //     address auditor;
    //     uint256 created;
    //     uint256 inspectionDuration;
    //     bool isVoided;
    // }
    // mapping(uint256 => CheqWrapper) public cheqWrappers;
    mapping(uint256 => address) public cheqAuditor;
    mapping(uint256 => uint256) public cheqCreated;
    mapping(uint256 => uint256) public cheqInspectionPeriod;
    mapping(uint256 => bool) public cheqVoided;

    mapping(address => bool) public acceptsResolver;  // Allow users to opt-in

    constructor(Cheq _cheq){
        cheq = _cheq;
    }

    function isWriteable(address sender, IERC20 _token, uint256 amount, uint256 escrowed, address recipient) public pure returns(bool) { 
        // See if writer has enough deposit on Cheq or let Cheq do that?
        return true;
    }

    function writeCheque(
        IERC20 _token,
        uint256 amount,
        uint256 escrowed,
        address recipient,
        address owner,
        address auditor,
        uint256 inspectionPeriod
        ) external returns(uint256){
        require(isWriteable(msg.sender, _token, amount, escrowed, recipient), "Not writeable");
        uint256 cheqId = cheq.writeCheque(msg.sender, recipient, _token, amount, escrowed, this, owner);  // TODO Rewrite arg order to a standard form across write_()
        cheqCreated[cheqId] = block.timestamp;
        cheqAuditor[cheqId] = auditor;
        cheqInspectionPeriod[cheqId] = inspectionPeriod;
        // cheqWrappers[cheqId] = CheqWrapper({auditor: auditor, created: block.timestamp, inspectionDuration: inspectionPeriod, isVoided:false});
        return cheqId;
    }

    function cashable(uint256 chequeID, address caller) public view returns(uint256) {  // Let anyone see what's cashable, ALSO 
        if (block.timestamp >= cheqCreated[chequeID]+cheqInspectionPeriod[chequeID] 
            || cheq.ownerOf(chequeID)!=caller 
            || cheqVoided[chequeID]){
            return 0;
        } else{
            return cheq.chequeEscrowed(chequeID);
        }
    }

    function cashCheque(uint256 chequeID) external {
        // require(cheq.ownerOf(chequeID)==msg.sender, "Non-owner");  // Keep this check to let user know they don't own it?
        uint256 cashingAmount = cashable(chequeID, msg.sender);
        require(cashingAmount>0, "Not cashable");
        cheq.cashCheque(chequeID, msg.sender, cashingAmount);
    }
    
    function isTransferable(uint256 chequeID, address caller) public view returns(bool){
        // cheq._isApprovedOrOwner(caller, chequeID);  // Need to find out if this is true and return it
        return cheq.ownerOf(chequeID)==caller;
    }

    function transferCheque(uint256 chequeID, address to) external{
        require(isTransferable(chequeID, msg.sender), "Not-owner");
        cheq.transferFrom(msg.sender, to, chequeID);
    }

    function voidCheque(uint256 chequeID) external {
        require(cheqAuditor[chequeID]==msg.sender, "Only auditor");
        cheqVoided[chequeID] = true;
        cheq.cashCheque(chequeID, cheq.chequeDrawer(chequeID), cheq.chequeEscrowed(chequeID));  // Return escrow to drawer
    }

    function isFundable(uint256 chequeID, address caller, uint256 amount) external view returns(bool) {
        
    }
}