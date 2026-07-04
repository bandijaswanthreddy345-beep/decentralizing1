// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RoomRegistry
 * @notice On-chain registry for EtherX Meet rooms.
 *         Tracks room ownership and exposes host-verification helpers
 *         consumed by the backend blockchainAuth middleware.
 */
contract RoomRegistry is Ownable {
    // ─── Storage ────────────────────────────────────────────────────────────

    /// @dev roomId (bytes32) → owner address
    mapping(bytes32 => address) private _roomOwner;

    /// @dev owner address → list of roomIds they created
    mapping(address => bytes32[]) private _ownedRooms;

    // ─── Events ─────────────────────────────────────────────────────────────

    /// @notice Emitted when a new room is registered on-chain.
    event RoomCreated(bytes32 indexed roomId, address indexed owner);

    /// @notice Emitted when room ownership is transferred to a new address.
    event RoomOwnershipTransferred(
        bytes32 indexed roomId,
        address indexed previousOwner,
        address indexed newOwner
    );

    // ─── Constructor ────────────────────────────────────────────────────────

    /// @param initialOwner Address that becomes the Ownable contract admin.
    constructor(address initialOwner) Ownable(initialOwner) {}

    // ─── External Functions ─────────────────────────────────────────────────

    /**
     * @notice Register a new room. The caller becomes the room owner.
     * @param roomId Unique identifier for the room (bytes32).
     */
    function createRoom(bytes32 roomId) external {
        require(roomId != bytes32(0), "RoomRegistry: roomId cannot be empty");
        require(
            _roomOwner[roomId] == address(0),
            "RoomRegistry: room already exists"
        );

        _roomOwner[roomId] = msg.sender;
        _ownedRooms[msg.sender].push(roomId);

        emit RoomCreated(roomId, msg.sender);
    }

    /**
     * @notice Transfer ownership of a room to a new address.
     * @param roomId  The room to transfer.
     * @param newOwner The address that will become the new owner.
     */
    function transferRoomOwnership(
        bytes32 roomId,
        address newOwner
    ) external {
        require(newOwner != address(0), "RoomRegistry: new owner is zero address");
        require(
            _roomOwner[roomId] == msg.sender,
            "RoomRegistry: caller is not room owner"
        );

        address previousOwner = msg.sender;
        _roomOwner[roomId] = newOwner;
        _ownedRooms[newOwner].push(roomId);

        emit RoomOwnershipTransferred(roomId, previousOwner, newOwner);
    }

    // ─── View Functions ──────────────────────────────────────────────────────

    /**
     * @notice Returns the owner address of a given room.
     * @param roomId The room to query.
     */
    function getRoomOwner(bytes32 roomId) external view returns (address) {
        return _roomOwner[roomId];
    }

    /**
     * @notice Returns true if `account` owns the given room.
     * @param roomId  The room to check.
     * @param account The address to verify.
     */
    function ownsRoom(
        bytes32 roomId,
        address account
    ) external view returns (bool) {
        return _roomOwner[roomId] == account;
    }

    /**
     * @notice Returns true if `account` is the host (owner) of the room.
     *         Alias of ownsRoom — kept separate for semantic clarity in middleware.
     * @param roomId  The room to check.
     * @param account The address to verify.
     */
    function isHost(
        bytes32 roomId,
        address account
    ) external view returns (bool) {
        return _roomOwner[roomId] == account;
    }

    /**
     * @notice Returns all roomIds owned by `account`.
     * @param account The address to query.
     */
    function getOwnedRooms(
        address account
    ) external view returns (bytes32[] memory) {
        return _ownedRooms[account];
    }
}
