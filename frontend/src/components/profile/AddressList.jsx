import React, { useState, useEffect } from "react";
import { Button, Badge, Row, Col, Modal, Form } from "react-bootstrap";
import { FaPlus, FaTrash, FaPen, FaMapMarkerAlt, FaCheckCircle, FaSpinner } from "react-icons/fa";
import userApi from "../../services/user.service";
import { useAuth } from "../../hooks/useAuth";
import toast from 'react-hot-toast';

const AddressList = () => {
  const { user, login } = useAuth(); // login() dùng để update lại User Context
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // Trạng thái tải dữ liệu ban đầu
  
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  // State Form
  const [formData, setFormData] = useState({
      fullName: "",
      phone: "",
      addressLine: "",
      city: "",
      province: "",
      isDefault: false
  });

  // --- CẢI TIẾN 1: Tự động tải dữ liệu mới nhất khi vào trang ---
  useEffect(() => {
      const fetchLatestProfile = async () => {
          try {
              const res = await userApi.getProfile();
              if (res.success) {
                  // Cập nhật context và local state
                  login(res.data); 
                  setAddresses(res.data.addresses || []);
              }
          } catch (error) {
              console.error("Lỗi tải profile:", error);
          } finally {
              setFetching(false);
          }
      };

      fetchLatestProfile();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Đồng bộ address từ User Context (Dự phòng)
  useEffect(() => {
      if (user?.addresses) {
          setAddresses(user.addresses);
      }
  }, [user]);

  // Hàm refresh data sau khi sửa đổi
  const refreshUser = async () => {
      try {
          const res = await userApi.getProfile();
          if (res.success) {
              login(res.data);
              setAddresses(res.data.addresses || []);
          }
      } catch (error) {
          console.error("Lỗi làm mới profile", error);
      }
  };

  // Mở modal thêm mới
  const handleAdd = () => {
      setEditingAddress(null);
      setFormData({ 
          fullName: user?.name || "", 
          phone: user?.phone || "", 
          addressLine: "", 
          city: "", 
          province: "", 
          isDefault: false 
      });
      setShowModal(true);
  };

  // Mở modal sửa
  const handleEdit = (addr) => {
      setEditingAddress(addr);
      setFormData({
          fullName: addr.fullName,
          phone: addr.phone,
          addressLine: addr.addressLine,
          city: addr.city,
          province: addr.province,
          isDefault: addr.isDefault
      });
      setShowModal(true);
  };

  // Xử lý Lưu
  const handleSave = async () => {
      if (!formData.fullName.trim() || !formData.phone.trim() || !formData.addressLine.trim() || !formData.city.trim() || !formData.province.trim()) {
          toast.error("Vui lòng điền đầy đủ thông tin!");
          return;
      }

      setLoading(true);
      try {
          let res;
          if (editingAddress) {
              res = await userApi.updateAddress(editingAddress._id, formData);
          } else {
              res = await userApi.addAddress(formData);
          }

          if (res.success) {
              toast.success(editingAddress ? "Đã cập nhật địa chỉ!" : "Thêm địa chỉ thành công!");
              setShowModal(false);
              await refreshUser();
          }
      } catch (error) {
          toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      } finally {
          setLoading(false);
      }
  };

  // Xử lý Xóa
  const handleDelete = async (id) => {
      if (window.confirm("Bạn chắc chắn muốn xóa địa chỉ này?")) {
          try {
              const res = await userApi.deleteAddress(id);
              if (res.success) {
                  toast.success("Đã xóa địa chỉ");
                  await refreshUser();
              }
          } catch {
              toast.error("Lỗi khi xóa địa chỉ");
          }
      }
  };

  // Xử lý Đặt mặc định
  const handleSetDefault = async (id) => {
      try {
          const res = await userApi.setDefaultAddress(id);
          if (res.success) {
              toast.success("Đã đặt làm địa chỉ mặc định");
              await refreshUser();
          }
      } catch {
          toast.error("Lỗi cập nhật mặc định");
      }
  };

  if (fetching) {
      return <div className="text-center py-5"><FaSpinner className="fa-spin text-success" size={30}/></div>;
  }

  return (
    <div className="  animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h4 className="fw-bold mb-0 text-success"><FaMapMarkerAlt className="me-2"/>Sổ địa chỉ</h4>
        <Button variant="success" size="sm" className="rounded-pill px-3 shadow-sm fw-bold" onClick={handleAdd}>
          <FaPlus className="me-1" /> Thêm địa chỉ
        </Button>
      </div>

      {/* --- CẢI TIẾN 2: THANH CUỘN (SCROLLBAR) --- */}
      <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }} className="custom-scrollbar">
          {addresses.length === 0 ? (
              <div className="text-center py-5 text-muted bg-light rounded-4 border border-dashed">
                  <FaMapMarkerAlt size={40} className="mb-3 opacity-50"/>
                  <p>Bạn chưa lưu địa chỉ nào.</p>
                  <Button variant="outline-success" size="sm" onClick={handleAdd}>Thêm ngay</Button>
              </div>
          ) : (
              addresses.map((item) => (
                <div key={item._id} className={`border rounded-4 p-3 mb-3 bg-white shadow-sm transition-all position-relative ${item.isDefault ? 'border-success border-2' : 'border-light'}`}>
                  <Row className="align-items-center">
                    <Col md={9}>
                      <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                          <span className="fw-bold fs-5">{item.fullName}</span>
                          <div className="vr mx-1"></div>
                          <span className="text-muted">{item.phone}</span>
                          
                          {item.isDefault && (
                              <Badge bg="success" className="d-flex align-items-center gap-1 py-1 px-2 rounded-pill">
                                  <FaCheckCircle size={10}/> Mặc định
                              </Badge>
                          )}
                      </div>
                      <p className="text-secondary mb-0 small opacity-75">
                          {item.addressLine}, {item.city}, {item.province}
                      </p>
                    </Col>
                    
                    <Col md={3} className="d-flex align-items-center justify-content-md-end gap-2 mt-3 mt-md-0">
                      {!item.isDefault && (
                          <Button variant="outline-secondary" size="sm" className="rounded-pill text-xs px-2 border-0" onClick={() => handleSetDefault(item._id)}>
                              Đặt mặc định
                          </Button>
                      )}
                      <Button variant="light" size="sm" className="rounded-circle p-2 text-primary hover-scale shadow-sm border" title="Chỉnh sửa" onClick={() => handleEdit(item)}>
                          <FaPen size={14}/>
                      </Button>
                      <Button variant="light" size="sm" className="rounded-circle p-2 text-danger hover-scale shadow-sm border" title="Xóa" onClick={() => handleDelete(item._id)}>
                          <FaTrash size={14}/>
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))
          )}
      </div>

      {/* Modal Thêm/Sửa (Giữ nguyên) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="eco-modal">
          <Modal.Header closeButton className="border-0">
              <Modal.Title className="fw-bold text-success">{editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form>
                  <Row>
                      <Col md={6}>
                          <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">HỌ VÀ TÊN <span className="text-danger">*</span></Form.Label>
                              <Form.Control 
                                type="text" 
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                className="modern-input"
                                placeholder="Nhập họ tên"
                              />
                          </Form.Group>
                      </Col>
                      <Col md={6}>
                          <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">SỐ ĐIỆN THOẠI <span className="text-danger">*</span></Form.Label>
                              <Form.Control 
                                type="text" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="modern-input"
                                placeholder="Nhập SĐT"
                              />
                          </Form.Group>
                      </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-muted">ĐỊA CHỈ (Số nhà, Đường) <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        as="textarea" rows={2} 
                        value={formData.addressLine}
                        onChange={(e) => setFormData({...formData, addressLine: e.target.value})}
                        className="modern-input"
                        placeholder="Ví dụ: 123 Đường Nguyễn Huệ"
                      />
                  </Form.Group>
                  <Row>
                      <Col md={6}>
                          <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">QUẬN / HUYỆN <span className="text-danger">*</span></Form.Label>
                              <Form.Control 
                                type="text" 
                                value={formData.city}
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                className="modern-input"
                                placeholder="Quận 1"
                              />
                          </Form.Group>
                      </Col>
                      <Col md={6}>
                          <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">TỈNH / THÀNH PHỐ <span className="text-danger">*</span></Form.Label>
                              <Form.Control 
                                type="text" 
                                value={formData.province}
                                onChange={(e) => setFormData({...formData, province: e.target.value})}
                                className="modern-input"
                                placeholder="Hồ Chí Minh"
                              />
                          </Form.Group>
                      </Col>
                  </Row>
                  
                  <Form.Check 
                    type="switch" 
                    id="default-switch" 
                    label="Đặt làm địa chỉ mặc định" 
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    className="fw-medium text-success mt-2"
                  />
              </Form>
          </Modal.Body>
          <Modal.Footer className="border-0">
              <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4">Hủy</Button>
              <Button variant="success" className="rounded-pill px-4 fw-bold shadow-sm" onClick={handleSave} disabled={loading}>
                  {loading ? <FaSpinner className="fa-spin"/> : "Lưu Địa Chỉ"}
              </Button>
          </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddressList;