// Explicitly register Hardhat's chai matchers (emit, revertedWith, etc.)
// before importing expect. This is required because chai v4.4+ throws
// "Invalid Chai property" for unknown matchers accessed before the plugin
// is registered — and Hardhat's toolbox plugin load order is not guaranteed
// to complete before the test file's require() calls resolve.
require("@nomicfoundation/hardhat-chai-matchers/internal/add-chai-matchers");

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RoomRegistry", function () {
  let registry;
  let owner;
  let addr1;
  let addr2;

  const ROOM_A = ethers.encodeBytes32String("room-alpha");
  const ROOM_B = ethers.encodeBytes32String("room-beta");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const RoomRegistry = await ethers.getContractFactory("RoomRegistry");
    registry = await RoomRegistry.deploy(owner.address);
    await registry.waitForDeployment();
  });

  // ── createRoom ─────────────────────────────────────────────────────────────

  describe("createRoom", function () {
    it("registers a room and sets caller as owner", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      expect(await registry.getRoomOwner(ROOM_A)).to.equal(addr1.address);
    });

    it("emits RoomCreated event", async function () {
      await expect(registry.connect(addr1).createRoom(ROOM_A))
        .to.emit(registry, "RoomCreated")
        .withArgs(ROOM_A, addr1.address);
    });

    it("reverts on empty roomId", async function () {
      await expect(
        registry.connect(addr1).createRoom(ethers.ZeroHash)
      ).to.be.revertedWith("RoomRegistry: roomId cannot be empty");
    });

    it("reverts if room already exists", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      await expect(
        registry.connect(addr2).createRoom(ROOM_A)
      ).to.be.revertedWith("RoomRegistry: room already exists");
    });

    it("tracks multiple rooms per owner", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      await registry.connect(addr1).createRoom(ROOM_B);
      const rooms = await registry.getOwnedRooms(addr1.address);
      expect(rooms).to.have.lengthOf(2);
      expect(rooms).to.include(ROOM_A);
      expect(rooms).to.include(ROOM_B);
    });
  });

  // ── ownsRoom ───────────────────────────────────────────────────────────────

  describe("ownsRoom", function () {
    it("returns true for the room owner", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      expect(await registry.ownsRoom(ROOM_A, addr1.address)).to.be.true;
    });

    it("returns false for a non-owner", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      expect(await registry.ownsRoom(ROOM_A, addr2.address)).to.be.false;
    });

    it("returns false for an unregistered room", async function () {
      expect(await registry.ownsRoom(ROOM_A, addr1.address)).to.be.false;
    });
  });

  // ── isHost ─────────────────────────────────────────────────────────────────

  describe("isHost", function () {
    it("returns true for the room host", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      expect(await registry.isHost(ROOM_A, addr1.address)).to.be.true;
    });

    it("returns false for a non-host", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      expect(await registry.isHost(ROOM_A, addr2.address)).to.be.false;
    });
  });

  // ── transferRoomOwnership ──────────────────────────────────────────────────

  describe("transferRoomOwnership", function () {
    it("transfers ownership to a new address", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      await registry.connect(addr1).transferRoomOwnership(ROOM_A, addr2.address);
      expect(await registry.getRoomOwner(ROOM_A)).to.equal(addr2.address);
    });

    it("emits RoomOwnershipTransferred event", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      await expect(
        registry.connect(addr1).transferRoomOwnership(ROOM_A, addr2.address)
      )
        .to.emit(registry, "RoomOwnershipTransferred")
        .withArgs(ROOM_A, addr1.address, addr2.address);
    });

    it("new owner passes ownsRoom and isHost checks", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      await registry.connect(addr1).transferRoomOwnership(ROOM_A, addr2.address);
      expect(await registry.ownsRoom(ROOM_A, addr2.address)).to.be.true;
      expect(await registry.isHost(ROOM_A, addr2.address)).to.be.true;
    });

    it("previous owner fails ownsRoom after transfer", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      await registry.connect(addr1).transferRoomOwnership(ROOM_A, addr2.address);
      expect(await registry.ownsRoom(ROOM_A, addr1.address)).to.be.false;
    });

    it("reverts if caller is not the owner", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      await expect(
        registry.connect(addr2).transferRoomOwnership(ROOM_A, addr2.address)
      ).to.be.revertedWith("RoomRegistry: caller is not room owner");
    });

    it("reverts if newOwner is zero address", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      await expect(
        registry.connect(addr1).transferRoomOwnership(ROOM_A, ethers.ZeroAddress)
      ).to.be.revertedWith("RoomRegistry: new owner is zero address");
    });
  });

  // ── getOwnedRooms ──────────────────────────────────────────────────────────

  describe("getOwnedRooms", function () {
    it("returns empty array for address with no rooms", async function () {
      const rooms = await registry.getOwnedRooms(addr1.address);
      expect(rooms).to.have.lengthOf(0);
    });

    it("returns all rooms created by an address", async function () {
      await registry.connect(addr1).createRoom(ROOM_A);
      await registry.connect(addr1).createRoom(ROOM_B);
      const rooms = await registry.getOwnedRooms(addr1.address);
      expect(rooms).to.have.lengthOf(2);
    });
  });
});
