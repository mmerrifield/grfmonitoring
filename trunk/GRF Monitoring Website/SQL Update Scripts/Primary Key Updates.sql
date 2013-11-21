USE [Garcia]
GO

IF NOT EXISTS (SELECT * FROM sys.key_constraints WHERE type = 'PK' AND parent_object_id = OBJECT_ID('dbo.HOBO') AND Name = 'PK_HOBO')
 
ALTER TABLE [HOBO]
ADD CONSTRAINT [PK_HOBO]
PRIMARY KEY CLUSTERED ([ID] ASC)

GO

IF NOT EXISTS (SELECT * FROM sys.key_constraints WHERE type = 'PK' AND parent_object_id = OBJECT_ID('dbo.lut_SITE_INFO') AND Name = 'PK_lut_SITE_INFO')
 
ALTER TABLE [lut_SITE_INFO]
ADD CONSTRAINT [PK_lut_SITE_INFO]
PRIMARY KEY CLUSTERED ([OBJECTID] ASC)

GO

IF NOT EXISTS (SELECT * FROM sys.key_constraints WHERE type = 'PK' AND parent_object_id = OBJECT_ID('dbo.lut_SITE_x_HOBO') AND Name = 'PK_lut_SITE_x_HOBO')
 
ALTER TABLE [lut_SITE_x_HOBO]
ADD CONSTRAINT [PK_lut_SITE_x_HOBO]
PRIMARY KEY CLUSTERED ([OBJECTID] ASC)

GO
